from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryDetailView,
    MarketplaceListingListView,
    ListingDetailView,
    CreateListingView,
    MyListingsView,
    AdminListingModerationView,
    AdminListingApprovalActionView,
    ReviewCreateView,
    UserReviewsListView,
    ReportCreateView,
    AdminReportListView,
    AdminReportResolveView,
)

urlpatterns = [
    # Categories
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    # Listings
    path('listings/', MarketplaceListingListView.as_view(), name='listing-list'),
    path('listings/create/', CreateListingView.as_view(), name='listing-create'),
    path('listings/my/', MyListingsView.as_view(), name='my-listings'),
    path('listings/<int:pk>/', ListingDetailView.as_view(), name='listing-detail'),

    # Admin Listing Moderation
    path('admin/listings/', AdminListingModerationView.as_view(), name='admin-listings'),
    path('admin/listings/<int:pk>/action/', AdminListingApprovalActionView.as_view(), name='admin-listing-action'),

    # Reviews
    path('reviews/', ReviewCreateView.as_view(), name='review-create'),
    path('users/<int:user_id>/reviews/', UserReviewsListView.as_view(), name='user-reviews'),

    # Reports
    path('reports/', ReportCreateView.as_view(), name='report-create'),
    path('admin/reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('admin/reports/<int:pk>/resolve/', AdminReportResolveView.as_view(), name='admin-report-resolve'),
]

