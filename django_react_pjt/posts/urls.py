from django.urls import path
from .views import (PostListView, PostCreateView, 
PostSearchView, ApplyToPostView, ResearcherDashboardView, 
EditPostView, ClosePostView, WithdrawApplicationView, 
GeneralUserDashboardView, BookmarkPostView,
BookmarkListView, NotificationListView, ReopenPostView, DeletePostView)

urlpatterns = [
    path('',        PostListView.as_view(),   name='post-list'),
    path('create/', PostCreateView.as_view(), name='post-create'),
    path('search/', PostSearchView.as_view(), name='post-search'),
    path('<int:post_id>/apply/', ApplyToPostView.as_view(), name='post-apply'),
    path('<int:post_id>/withdraw/', WithdrawApplicationView.as_view(), name='post-withdraw'),
    path('<int:post_id>/bookmark/', BookmarkPostView.as_view(),        name='post-bookmark'),
    path('dashboard/', ResearcherDashboardView.as_view(), name='dashboard'),
    path('applications/', GeneralUserDashboardView.as_view(), name='applications'),
    path('notifications/', NotificationListView.as_view(),    name='notifications'),
    path('bookmarks/', BookmarkListView.as_view(),        name='bookmarks'),
    path('<int:post_id>/edit/', EditPostView.as_view(),   name='post-edit'),
    path('<int:post_id>/close/', ClosePostView.as_view(), name='post-close'),
    path('<int:post_id>/reopen/', ReopenPostView.as_view(), name='post-reopen'),
    path('<int:post_id>/delete/', DeletePostView.as_view(), name='post-delete'),
]