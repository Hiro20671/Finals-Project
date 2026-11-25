from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from accounts.permissions import IsAdminRole
from marketplace.models import Listing, AcademicMaterial, Category, Report
from transactions.models import TransactionRequest, BorrowingRecord
from communications.models import Notification


class StudentDashboardStatsView(APIView):
    """Provides metric cards and summary data for the authenticated student dashboard"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        active_listings_count = Listing.objects.filter(material__owner=user, status='AVAILABLE').count()
        my_selling_listings = Listing.objects.filter(material__owner=user, listing_type='SALE').count()
        my_borrowing_requests = TransactionRequest.objects.filter(requester=user, request_type='BORROW').count()
        my_lending_requests = TransactionRequest.objects.filter(owner=user, request_type='BORROW').count()
        my_purchase_requests = TransactionRequest.objects.filter(requester=user, request_type='BUY').count()
        my_completed_transactions = TransactionRequest.objects.filter(
            Q(requester=user) | Q(owner=user),
            status='COMPLETED'
        ).count()

        # Active borrowings currently in hand
        active_borrowings = BorrowingRecord.objects.filter(borrower=user, status__in=['ACTIVE', 'OVERDUE']).count()

        # Recent notifications
        recent_notifications = Notification.objects.filter(recipient=user).order_by('-created_at')[:5].values(
            'id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'action_url'
        )

        return Response({
            'active_listings_count': active_listings_count,
            'my_selling_listings': my_selling_listings,
            'my_borrowing_requests': my_borrowing_requests,
            'my_lending_requests': my_lending_requests,
            'my_purchase_requests': my_purchase_requests,
            'my_completed_transactions': my_completed_transactions,
            'active_borrowings_in_hand': active_borrowings,
            'recent_notifications': list(recent_notifications),
        })


class AdminDashboardStatsView(APIView):
    """Provides platform metrics and chart datasets for the Administrator Dashboard"""
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_students = User.objects.filter(is_superuser=False).count()
        total_materials = AcademicMaterial.objects.count()
        active_listings = Listing.objects.filter(status='AVAILABLE', approval_status='APPROVED').count()
        pending_approvals = Listing.objects.filter(approval_status='PENDING').count()
        total_borrowings = BorrowingRecord.objects.count()
        total_completed_transactions = TransactionRequest.objects.filter(status='COMPLETED').count()
        reported_listings = Report.objects.filter(status__in=['PENDING', 'INVESTIGATING']).count()

        # Distribution of transaction types (SALE, LEND, DONATION, EXCHANGE)
        type_distribution_qs = Listing.objects.values('listing_type').annotate(count=Count('id'))
        type_distribution = {item['listing_type']: item['count'] for item in type_distribution_qs}

        # Most popular categories by material count
        popular_categories_qs = Category.objects.annotate(material_total=Count('materials')).order_by('-material_total')[:6]
        popular_categories = [
            {'name': cat.name, 'count': cat.material_total} for cat in popular_categories_qs
        ]

        # Monthly registrations (last 6 months)
        now = timezone.now()
        monthly_registrations = []
        monthly_transactions = []
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=i * 30)
            month_label = month_date.strftime('%b %Y')
            start_date = month_date.replace(day=1, hour=0, minute=0, second=0)
            # Rough month calculation
            if start_date.month == 12:
                end_date = start_date.replace(year=start_date.year + 1, month=1)
            else:
                end_date = start_date.replace(month=start_date.month + 1)

            reg_count = User.objects.filter(date_joined__gte=start_date, date_joined__lt=end_date).count()
            trans_count = TransactionRequest.objects.filter(created_at__gte=start_date, created_at__lt=end_date).count()

            monthly_registrations.append({'month': month_label, 'count': reg_count})
            monthly_transactions.append({'month': month_label, 'count': trans_count})

        # Recent activities
        recent_requests = TransactionRequest.objects.select_related('requester', 'listing__material').order_by('-created_at')[:8]
        recent_activities = [
            {
                'id': req.id,
                'user': req.requester.get_full_name() or req.requester.username,
                'action': f"Requested {req.get_request_type_display().lower()} for '{req.listing.material.title}'",
                'type': req.request_type,
                'status': req.status,
                'timestamp': req.created_at,
            }
            for req in recent_requests
        ]

        return Response({
            'overview': {
                'total_students': total_students,
                'total_materials': total_materials,
                'active_listings': active_listings,
                'pending_approvals': pending_approvals,
                'total_borrowing_transactions': total_borrowings,
                'total_completed_transactions': total_completed_transactions,
                'reported_listings': reported_listings,
            },
            'charts': {
                'monthly_registrations': monthly_registrations,
                'popular_categories': popular_categories,
                'monthly_transactions': monthly_transactions,
                'type_distribution': type_distribution,
            },
            'recent_activities': recent_activities,
        })

