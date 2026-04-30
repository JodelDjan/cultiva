from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SignUpView, LoginView, LogoutView, ProfileView, ResearcherDirectoryView, PublicResearcherProfileView, EditProfileView

urlpatterns = [
    path('register/', SignUpView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/edit/', EditProfileView.as_view(), name='edit-profile'),
    path('profile/<int:user_id>/', PublicResearcherProfileView.as_view(), name='public-profile'),
    path('directory/',   ResearcherDirectoryView.as_view(), name='directory'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),   
]