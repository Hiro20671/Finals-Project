from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView,
    PublicStudentProfileView,
    AdminUserListView,
    AdminToggleUserStatusView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('students/<int:id>/', PublicStudentProfileView.as_view(), name='public-student-profile'),

    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/users/<int:user_id>/status/', AdminToggleUserStatusView.as_view(), name='admin-user-status'),
]

