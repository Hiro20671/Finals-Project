from django.db.models import Q, Avg, F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from accounts.permissions import IsOwnerOrReadOnly, IsAdminRole
from accounts.models import StudentProfile
from .models import Category, AcademicMaterial, MaterialImage, Listing, Review, Report
from .serializers import (
    CategorySerializer,
    AcademicMaterialSerializer,
    ListingSerializer,
    CreateListingSerializer,
    ReviewSerializer,
    ReportSerializer,
)


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return [permissions.AllowAny()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminRole]


class MarketplaceListingListView(generics.ListAPIView):
    """
    Public marketplace feed for browsing and searching academic materials.
    Filters: search, category, listing_type, condition, min_price, max_price, ordering
    """
    serializer_class = ListingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Base query: approved and active listings
        qs = Listing.objects.filter(
            approval_status='APPROVED'
        ).select_related(
            'material', 'material__owner', 'material__owner__student_profile', 'material__category'
        ).prefetch_related('material__images')

        # Filter by status: default to AVAILABLE unless requested otherwise
        status_param = self.request.query_params.get('status')
        if status_param:
            if status_param != 'ALL':
                qs = qs.filter(status=status_param)
        else:
            qs = qs.filter(status='AVAILABLE')

        # Search parameter (across title, author, subject code, course name, description)
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(material__title__icontains=search) |
                Q(material__author__icontains=search) |
                Q(material__subject_code__icontains=search) |
                Q(material__course_name__icontains=search) |
                Q(material__description__icontains=search)
            )

        # Category filter (by id or slug)
        category_param = self.request.query_params.get('category')
        if category_param:
            if category_param.isdigit():
                qs = qs.filter(material__category_id=category_param)
            else:
                qs = qs.filter(material__category__slug=category_param)

        # Transaction type filter (SALE, LEND, DONATION, EXCHANGE)
        listing_type = self.request.query_params.get('listing_type')
        if listing_type:
            qs = qs.filter(listing_type=listing_type.upper())

        # Condition filter (NEW, GOOD, FAIR, USED)
        condition = self.request.query_params.get('condition')
        if condition:
            qs = qs.filter(material__condition=condition.upper())

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        if min_price and min_price.isdigit():
            qs = qs.filter(price__gte=min_price)

        max_price = self.request.query_params.get('max_price')
        if max_price and max_price.isdigit():
            qs = qs.filter(price__lte=max_price)

        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering == 'price_asc':
            qs = qs.order_by('price', '-created_at')
        elif ordering == 'price_desc':
            qs = qs.order_by('-price', '-created_at')
        elif ordering == 'popular':
            qs = qs.order_by('-views_count', '-created_at')
        elif ordering == 'oldest':
            qs = qs.order_by('created_at')
        else:
            qs = qs.order_by('-created_at')

        return qs


class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Listing.objects.all().select_related('material', 'material__owner')
    serializer_class = ListingSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CreateListingSerializer
        return ListingSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views counter atomically
        Listing.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CreateListingView(generics.CreateAPIView):
    serializer_class = CreateListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save()


class MyListingsView(generics.ListAPIView):
    """Listings uploaded by the currently authenticated student"""
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Listing.objects.filter(material__owner=user).select_related(
            'material', 'material__category'
        ).prefetch_related('material__images').order_by('-created_at')

        listing_type = self.request.query_params.get('listing_type')
        if listing_type:
            qs = qs.filter(listing_type=listing_type.upper())

        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'ALL':
            qs = qs.filter(status=status_param)

        return qs


class AdminListingModerationView(generics.ListAPIView):
    """Admin view for reviewing and moderating all listings in the system"""
    serializer_class = ListingSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = Listing.objects.all().select_related(
            'material', 'material__owner', 'material__category'
        ).order_by('-created_at')

        approval_status = self.request.query_params.get('approval_status')
        if approval_status:
            qs = qs.filter(approval_status=approval_status)
        return qs


class AdminListingApprovalActionView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        listing = get_object_or_404(Listing, pk=pk)
        action = request.data.get('action') # 'APPROVE', 'REJECT', 'REMOVE'
        reason = request.data.get('reason', '')

        if action == 'APPROVE':
            listing.approval_status = 'APPROVED'
            listing.rejection_reason = ''
            listing.save()
            return Response({'message': 'Listing approved successfully.'})
        elif action == 'REJECT':
            listing.approval_status = 'REJECTED'
            listing.rejection_reason = reason
            listing.status = 'UNAVAILABLE'
            listing.save()
            return Response({'message': 'Listing rejected.'})
        elif action == 'REMOVE':
            listing.delete()
            return Response({'message': 'Listing permanently removed.'})

        return Response({'error': 'Invalid action. Choose APPROVE, REJECT, or REMOVE.'}, status=status.HTTP_400_BAD_REQUEST)


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        review = serializer.save(reviewer=self.request.user)

        # Recalculate average rating for the reviewed user
        reviewed_user = review.reviewed_user
        profile = getattr(reviewed_user, 'student_profile', None)
        if profile:
            reviews_qs = Review.objects.filter(reviewed_user=reviewed_user)
            avg_rating = reviews_qs.aggregate(Avg('rating'))['rating__avg'] or 5.00
            profile.average_rating = round(avg_rating, 2)
            profile.total_reviews_count = reviews_qs.count()
            profile.save()


class UserReviewsListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Review.objects.filter(reviewed_user_id=user_id).select_related('reviewer', 'reviewer__student_profile').order_by('-created_at')


class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class AdminReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = Report.objects.all().select_related('reporter', 'reported_user', 'reported_listing__material').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class AdminReportResolveView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.data.get('status') # 'RESOLVED', 'DISMISSED', 'INVESTIGATING'
        admin_notes = request.data.get('admin_notes', '')

        if new_status in ['RESOLVED', 'DISMISSED', 'INVESTIGATING']:
            report.status = new_status
            report.admin_notes = admin_notes
            report.resolved_by = request.user
            report.save()
            return Response({'message': 'Report status updated successfully.'})
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
