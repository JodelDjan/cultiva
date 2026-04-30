from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import Post, Application, Bookmark, Notification
from .serializers import PostSerializer, ApplicationSerializer, CreatePostSerializer
from .permissions import IsResearcher
from users.models import CustomUser, GeneralProfile
from rest_framework.parsers import MultiPartParser, FormParser

class PostListView(generics.ListAPIView):
    serializer_class   = PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        tag      = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__contains=tag)
        if self.request.user.is_authenticated:
            return queryset
        return queryset[:3]
    
class PostCreateView(generics.CreateAPIView):
    serializer_class   = CreatePostSerializer
    permission_classes = [IsAuthenticated, IsResearcher]
    parser_classes     = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)

        # send notifications to general users with matching tags
        if self.request.data.get('notify_matching', False):
            post_tags = post.tags
                
            # fallback for JSONField — check manually
            all_profiles = GeneralProfile.objects.select_related('user')
            for profile in all_profiles:
                if any(tag in profile.interests for tag in post_tags):
                    Notification.objects.create(
                        user    = profile.user,
                        message = f'{self.request.user.first_name} {self.request.user.last_name} posted "{post.title}" which matches your interests.'
                    )

class ReopenPostView(APIView):
    permission_classes = [IsAuthenticated, IsResearcher]

    def patch(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id, author=request.user)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        post.state = 'open'
        post.save()
        return Response({'message': 'Post reopened.'}, status=status.HTTP_200_OK)

class PostSearchView(generics.ListAPIView):
    """Search posts by content"""
    serializer_class   = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        return Post.objects.filter(content__icontains=query).order_by('-created_at')

class DeletePostView(APIView):
    permission_classes = [IsAuthenticated, IsResearcher]

    def delete(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id, author=request.user)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        post.delete()
        return Response({'message': 'Post deleted.'}, status=status.HTTP_200_OK)

class ApplyToPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        if request.user.role != CustomUser.GENERAL_USER:
            return Response(
                {'error': 'Only general users can apply to posts.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if post.state == 'closed':
            return Response(
                {'error': 'This post is no longer accepting applications.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if post.max_participants is not None and post.max_participants <= 0:
            return Response(
                {'error': 'This post has reached its maximum number of participants.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Application.objects.filter(post=post, user=request.user).exists():
            return Response(
                {'error': 'You have already applied to this post.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application = Application.objects.create(post=post, user=request.user)

        # decrease max_participants
        if post.max_participants is not None:
            post.max_participants -= 1
            post.save()

        # notify the researcher of new application
        Notification.objects.create(
            user    = post.author,
            message = f'{request.user.first_name} {request.user.last_name} applied to your post "{post.title}".'
        )

        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WithdrawApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, post_id):
        try:
            application = Application.objects.get(post_id=post_id, user=request.user)
        except Application.DoesNotExist:
            return Response(
                {'error': 'Application not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        post = application.post

        # restore max_participants
        if post.max_participants is not None:
            post.max_participants += 1
            post.save()

        application.delete()
        return Response({'message': 'Application withdrawn.'}, status=status.HTTP_200_OK)


class GeneralUserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != CustomUser.GENERAL_USER:
            return Response(
                {'error': 'Only general users can access this dashboard.'},
                status=status.HTTP_403_FORBIDDEN
            )

        applications = Application.objects.filter(user=request.user).select_related('post')
        data = [
            {
                'application_id': app.id,
                'post_id':        app.post.id,
                'title':          app.post.title,
                'author_name':    f"{app.post.author.first_name} {app.post.author.last_name}",
                'state':          app.post.state,
                'created_at':     app.created_at,
            }
            for app in applications
        ]
        return Response(data)
    
class ResearcherDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsResearcher]

    def get(self, request):
        posts = Post.objects.filter(author=request.user).prefetch_related('applications__user')
        data = []
        for post in posts:
            applications = post.applications.all()
            data.append({
                'post_id':           post.id,
                'title':             post.title,
                'application_count': applications.count(),
                'applicants': [
                    {
                        'first_name': app.user.first_name,
                        'last_name':  app.user.last_name,
                        'email':      app.user.email,
                    }
                    for app in applications
                ]
            })
        return Response(data)
    
class BookmarkPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        if not created:
            return Response({'error': 'Already bookmarked.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Post bookmarked.'}, status=status.HTTP_201_CREATED)

    def delete(self, request, post_id):
        try:
            bookmark = Bookmark.objects.get(user=request.user, post_id=post_id)
            bookmark.delete()
            return Response({'message': 'Bookmark removed.'}, status=status.HTTP_200_OK)
        except Bookmark.DoesNotExist:
            return Response({'error': 'Bookmark not found.'}, status=status.HTTP_404_NOT_FOUND)
        
class BookmarkListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookmarks = Bookmark.objects.filter(user=request.user).select_related('post')
        data = [
            {
                'bookmark_id': b.id,
                'post_id':     b.post.id,
                'title':       b.post.title,
                'author_name': f"{b.post.author.first_name} {b.post.author.last_name}",
                'state':       b.post.state,
                'created_at':  b.created_at,
            }
            for b in bookmarks
        ]
        return Response(data)
    
class EditPostView(APIView):
    permission_classes = [IsAuthenticated, IsResearcher]
    parser_classes =     [MultiPartParser, FormParser]

    def patch(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id, author=request.user)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreatePostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClosePostView(APIView):
    permission_classes = [IsAuthenticated, IsResearcher]

    def patch(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id, author=request.user)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        post.state = 'closed'
        post.save()

        #Closed notifications for bookmarked posts    
        bookmarks = Bookmark.objects.filter(post=post).select_related('user')
        for bookmark in bookmarks:
            Notification.objects.create(
                user    = bookmark.user,
                message = f'A post you bookmarked "{post.title}" by {post.author.first_name} {post.author.last_name} has been closed.'
            )

        return Response({'message': 'Post closed successfully.'}, status=status.HTTP_200_OK)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')
        data = [
            {
                'id':         n.id,
                'message':    n.message,
                'is_read':    n.is_read,
                'created_at': n.created_at,
            }
            for n in notifications
        ]
        # mark all as read when user visits notifications
        notifications.update(is_read=True)
        return Response(data)
    
