from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import SignUpSerializer
from .models import CustomUser, ResearcherProfile, GeneralProfile


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'role':    user.role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email')
        password = request.data.get('password')
        user     = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'role':    user.role
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
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
                data['department'] = profile.department
                data['tags']       = profile.tags
            except ResearcherProfile.DoesNotExist:
                pass

        elif user.role == CustomUser.GENERAL_USER:
            try:
                profile = user.general_user_profile
                data['age_range'] = profile.age_range
                data['tags']      = profile.tags
            except GeneralProfile.DoesNotExist:
                pass

        return Response(data)