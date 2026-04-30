from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import SignUpSerializer
from .models import CustomUser, ResearcherProfile, GeneralProfile
from posts.models import Post
from posts.serializers import PostSerializer


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user    = serializer.save()
            refresh = RefreshToken.for_user(user)
            response = Response({
                'role': user.role
            }, status=status.HTTP_201_CREATED)

            response.set_cookie(
                key      = 'access_token',
                value    = str(refresh.access_token),
                httponly = True,
                secure   = False,
                samesite = 'Lax',
                max_age  = 86400,
            )
            response.set_cookie(
                key      = 'refresh_token',
                value    = str(refresh),
                httponly = True,
                secure   = False,
                samesite = 'Lax',
                max_age  = 2592000,
            )
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email')
        password = request.data.get('password')
        user     = authenticate(request, email=email, password=password)

        if user is not None:
            refresh  = RefreshToken.for_user(user)
            response = Response({
                'role':       user.role,
                'first_name': user.first_name,
                'last_name':  user.last_name,
                'access':     str(refresh.access_token),
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key      = 'access_token',
                value    = str(refresh.access_token),
                httponly = True,
                secure   = False,
                samesite = 'Lax',
                max_age  = 86400,
            )
            response.set_cookie(
                key      = 'refresh_token',
                value    = str(refresh),
                httponly = True,
                secure   = False,
                samesite = 'Lax',
                max_age  = 2592000,
            )
            return response

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'first_name': user.first_name,
            'last_name':  user.last_name,
            'email':      user.email,
            'role':       user.role,
        }

        if user.role == CustomUser.RESEARCHER:
            try:
                profile = user.researcher_profile
                data['bio']        = profile.bio
                data['research_area'] = profile.research_area
                data['tags']       = profile.tags
            except ResearcherProfile.DoesNotExist:
                pass

        elif user.role == CustomUser.GENERAL_USER:
            try:
                profile = user.general_profile
                data['age_range'] = profile.age_range
                data['tags']      = profile.tags
            except GeneralProfile.DoesNotExist:
                pass

        return Response(data)

class ResearcherDirectoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        researchers = CustomUser.objects.filter(role=CustomUser.RESEARCHER)
        data = []
        for researcher in researchers:
            entry = {
                'id':         researcher.id,
                'first_name': researcher.first_name,
                'last_name':  researcher.last_name,
            }
            try:
                profile = researcher.researcher_profile
                entry['tags']       = profile.tags
                entry['research_area'] = profile.research_area
            except ResearcherProfile.DoesNotExist:
                entry['tags']       = []
                entry['research_area'] = ''
            data.append(entry)
        return Response(data)
    
class PublicResearcherProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            researcher = CustomUser.objects.get(id=user_id, role=CustomUser.RESEARCHER)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Researcher not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = {
            'first_name': researcher.first_name,
            'last_name':  researcher.last_name,
            'role':       researcher.role,
        }

        try:
            profile        = researcher.researcher_profile
            data['bio']        = profile.bio
            data['research_area'] = profile.research_area
            data['tags']       = profile.tags
        except ResearcherProfile.DoesNotExist:
            data['bio']        = ''
            data['research_area'] = ''
            data['tags']       = []
        
        posts         = Post.objects.filter(author=researcher).order_by('-created_at')
        data['posts'] = PostSerializer(posts, many=True).data

        return Response(data)
    

class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        data = request.data

        # Update base user fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name  = data.get('last_name', user.last_name)
        user.save()

        if user.role == CustomUser.RESEARCHER:
            try:
                profile = user.researcher_profile
            except ResearcherProfile.DoesNotExist:
                profile = ResearcherProfile(user=user)

            profile.bio           = data.get('bio', profile.bio)
            profile.research_area = data.get('research_area', profile.research_area)
            profile.tags          = data.get('tags', profile.tags)
            profile.save()

        elif user.role == CustomUser.GENERAL_USER:
            try:
                profile = user.general_user_profile
            except GeneralProfile.DoesNotExist:
                profile = GeneralProfile(user=user)

            profile.age_range = data.get('age_range', profile.age_range)
            profile.tags      = data.get('tags', profile.tags)
            profile.save()

        return Response({'message': 'Profile updated successfully.'}, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response