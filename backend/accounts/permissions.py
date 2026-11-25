from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners of an object to edit or delete it."""

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Check various common ownership patterns
        owner = getattr(obj, 'owner', None)
        if owner is None and hasattr(obj, 'user'):
            owner = obj.user
        if owner is None and hasattr(obj, 'material'):
            owner = obj.material.owner

        return owner == request.user or request.user.is_staff


class IsAdminRole(permissions.BasePermission):
    """Custom permission to check if user has Admin role or is staff."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        if hasattr(request.user, 'student_profile'):
            return request.user.student_profile.role == 'ADMIN'
        return False

