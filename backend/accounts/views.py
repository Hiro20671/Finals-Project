from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import StudentProfile
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    StudentProfileSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsAdminRole


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response({
                'token': token.key,
                'user': user_data,
                'message': 'Registration successful!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Allow logging in with either username or email
        user = authenticate(username=username, password=password)
        if not user:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'This account has been disabled.'}, status=status.HTTP_403_FORBIDDEN)

        # Check student profile status
        if hasattr(user, 'student_profile') and user.student_profile.account_status == 'SUSPENDED':
            return Response({'error': 'Your student account has been suspended. Please contact administrator.'}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data

        return Response({
            'token': token.key,
            'user': user_data,
            'message': f"Welcome back, {user.first_name or user.username}!"
        })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        profile = user.student_profile

        # Update basic user fields
        if 'first_name' in request.data:
            user.first_name = request.data.get('first_name')
        if 'last_name' in request.data:
            user.last_name = request.data.get('last_name')
        if 'email' in request.data:
            user.email = request.data.get('email')
        user.save()

        # Update profile fields
        profile_fields = [
            'student_id_number', 'university', 'college',
            'degree_program', 'year_level', 'contact_number', 'bio'
        ]
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data.get(field))

        # Check for profile picture upload
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']

        profile.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password updated successfully!'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicStudentProfileView(generics.RetrieveAPIView):
    """View public student details including their active listings and reviews"""
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class AdminUserListView(generics.ListAPIView):
    """Admin endpoint to view and manage registered students"""
    queryset = User.objects.all().select_related('student_profile').order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')
        role_filter = self.request.query_params.get('role')

        if search:
            qs = qs.filter(
                models.Q(username__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(student_profile__student_id_number__icontains=search)
            )
        if status_filter:
            qs = qs.filter(student_profile__account_status=status_filter)
        if role_filter:
            qs = qs.filter(student_profile__role=role_filter)

        return qs


class AdminToggleUserStatusView(APIView):
    """Admin endpoint to activate, suspend, or promote student accounts"""
    permission_classes = [IsAdminRole]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('account_status')
        make_admin = request.data.get('is_admin')

        if new_status and new_status in ['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']:
            target_user.student_profile.account_status = new_status
            target_user.is_active = (new_status != 'SUSPENDED')

        if make_admin is not None:
            target_user.is_staff = bool(make_admin)
            target_user.student_profile.role = 'ADMIN' if make_admin else 'STUDENT'

        target_user.student_profile.save()
        target_user.save()

        return Response({
            'message': f"User {target_user.username} status updated successfully.",
            'user': UserSerializer(target_user).data
        })
