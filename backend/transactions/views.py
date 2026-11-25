from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from communications.models import Notification
from marketplace.models import Listing
from .models import TransactionRequest, BorrowingRecord
from .serializers import (
    TransactionRequestSerializer,
    CreateTransactionRequestSerializer,
    BorrowingRecordSerializer,
)


class CreateTransactionRequestView(generics.CreateAPIView):
    serializer_class = CreateTransactionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        request_obj = serializer.save()
        # Create notification for listing owner
        Notification.objects.create(
            recipient=request_obj.owner,
            sender=self.request.user,
            notification_type='REQUEST_RECEIVED',
            title=f"New {request_obj.get_request_type_display()}",
            message=f"{self.request.user.get_full_name() or self.request.user.username} sent a {request_obj.get_request_type_display().lower()} for '{request_obj.listing.material.title}'.",
            action_url='/requests'
        )


class TransactionRequestListView(generics.ListAPIView):
    serializer_class = TransactionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = self.request.query_params.get('role') # 'sent', 'received', or None (both)
        req_type = self.request.query_params.get('type')
        status_param = self.request.query_params.get('status')

        if role == 'sent':
            qs = TransactionRequest.objects.filter(requester=user)
        elif role == 'received':
            qs = TransactionRequest.objects.filter(owner=user)
        else:
            qs = TransactionRequest.objects.filter(Q(requester=user) | Q(owner=user))

        if req_type:
            qs = qs.filter(request_type=req_type.upper())
        if status_param:
            qs = qs.filter(status=status_param.upper())

        return qs.select_related(
            'listing', 'listing__material', 'requester', 'owner', 'offered_material'
        ).order_by('-created_at')


class TransactionRequestDetailView(generics.RetrieveAPIView):
    queryset = TransactionRequest.objects.all()
    serializer_class = TransactionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return TransactionRequest.objects.all()
        return TransactionRequest.objects.filter(Q(requester=user) | Q(owner=user))


class TransactionRequestActionView(APIView):
    """
    Handle Owner or Requester actions: ACCEPT, REJECT, CANCEL, COMPLETE
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        trans_req = get_object_or_404(TransactionRequest, pk=pk)
        user = request.user
        action = request.data.get('action') # 'ACCEPT', 'REJECT', 'CANCEL', 'COMPLETE'
        notes = request.data.get('notes', '')
        meetup = request.data.get('meetup_location', '')

        # Action: CANCEL (only requester can cancel pending)
        if action == 'CANCEL':
            if trans_req.requester != user:
                return Response({'error': 'Only the requester can cancel this request.'}, status=status.HTTP_403_FORBIDDEN)
            if trans_req.status != 'PENDING':
                return Response({'error': 'Can only cancel pending requests.'}, status=status.HTTP_400_BAD_REQUEST)

            trans_req.status = 'CANCELLED'
            trans_req.save()

            Notification.objects.create(
                recipient=trans_req.owner,
                sender=user,
                notification_type='SYSTEM',
                title="Request Cancelled",
                message=f"{user.username} cancelled their {trans_req.get_request_type_display().lower()} for '{trans_req.listing.material.title}'.",
                action_url='/requests'
            )
            return Response({'message': 'Request cancelled successfully.'})

        # Actions requiring owner permission (ACCEPT, REJECT, COMPLETE)
        if trans_req.owner != user and not user.is_staff:
            # For complete, requester could also confirm completion
            if not (action == 'COMPLETE' and trans_req.requester == user):
                return Response({'error': 'Only the listing owner can perform this action.'}, status=status.HTTP_403_FORBIDDEN)

        if action == 'REJECT':
            trans_req.status = 'REJECTED'
            trans_req.owner_notes = notes
            trans_req.save()

            Notification.objects.create(
                recipient=trans_req.requester,
                sender=user,
                notification_type='REQUEST_REJECTED',
                title=f"{trans_req.get_request_type_display()} Declined",
                message=f"The owner declined your request for '{trans_req.listing.material.title}'. Note: {notes or 'No reason provided.'}",
                action_url='/requests'
            )
            return Response({'message': 'Request rejected.'})

        if action == 'ACCEPT':
            trans_req.status = 'ACCEPTED'
            trans_req.owner_notes = notes
            if meetup:
                trans_req.meetup_location = meetup
            trans_req.save()

            listing = trans_req.listing

            if trans_req.request_type == 'BORROW':
                # Create BorrowingRecord
                days = int(request.data.get('days') or listing.lending_period_days or 14)
                expected_return = timezone.now() + timedelta(days=days)

                BorrowingRecord.objects.get_or_create(
                    transaction_request=trans_req,
                    defaults={
                        'listing': listing,
                        'borrower': trans_req.requester,
                        'lender': trans_req.owner,
                        'borrowed_date': timezone.now(),
                        'expected_return_date': expected_return,
                        'status': 'ACTIVE',
                        'notes': notes,
                    }
                )
                listing.status = 'BORROWED'
                listing.save()

            elif trans_req.request_type == 'BUY':
                listing.status = 'PENDING'
                listing.save()

            elif trans_req.request_type == 'DONATION':
                listing.status = 'DONATED'
                listing.save()
                trans_req.status = 'COMPLETED'
                trans_req.completed_at = timezone.now()
                trans_req.save()

            elif trans_req.request_type == 'EXCHANGE':
                listing.status = 'EXCHANGED'
                listing.save()
                # If offered material had a listing, update it too
                if trans_req.offered_material and hasattr(trans_req.offered_material, 'listing'):
                    trans_req.offered_material.listing.status = 'EXCHANGED'
                    trans_req.offered_material.listing.save()
                trans_req.status = 'COMPLETED'
                trans_req.completed_at = timezone.now()
                trans_req.save()

            Notification.objects.create(
                recipient=trans_req.requester,
                sender=user,
                notification_type='REQUEST_ACCEPTED',
                title=f"{trans_req.get_request_type_display()} Accepted!",
                message=f"Your request for '{listing.material.title}' was accepted by {user.get_full_name() or user.username}!",
                action_url='/requests'
            )
            return Response({'message': 'Request accepted successfully.'})

        if action == 'COMPLETE':
            trans_req.status = 'COMPLETED'
            trans_req.completed_at = timezone.now()
            trans_req.save()

            listing = trans_req.listing
            if trans_req.request_type == 'BUY':
                listing.status = 'SOLD'
                listing.save()

            other_party = trans_req.requester if user == trans_req.owner else trans_req.owner
            Notification.objects.create(
                recipient=other_party,
                sender=user,
                notification_type='TRANSACTION_COMPLETED',
                title="Transaction Completed",
                message=f"The transaction for '{listing.material.title}' has been marked as completed! You can now leave a rating and review.",
                action_url=f"/reviews/new?transaction={trans_req.id}"
            )
            return Response({'message': 'Transaction marked as completed.'})

        return Response({'error': 'Invalid action requested.'}, status=status.HTTP_400_BAD_REQUEST)


class BorrowingRecordListView(generics.ListAPIView):
    serializer_class = BorrowingRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = self.request.query_params.get('role') # 'borrower' or 'lender'
        status_param = self.request.query_params.get('status')

        if role == 'borrower':
            qs = BorrowingRecord.objects.filter(borrower=user)
        elif role == 'lender':
            qs = BorrowingRecord.objects.filter(lender=user)
        else:
            qs = BorrowingRecord.objects.filter(Q(borrower=user) | Q(lender=user))

        # Update overdue records dynamically
        now = timezone.now()
        BorrowingRecord.objects.filter(status='ACTIVE', expected_return_date__lt=now).update(status='OVERDUE')

        if status_param:
            qs = qs.filter(status=status_param.upper())

        return qs.select_related('listing', 'listing__material', 'borrower', 'lender').order_by('-borrowed_date')


class ConfirmBookReturnView(APIView):
    """Lender confirms the physical book has been returned by borrower"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        record = get_object_or_404(BorrowingRecord, pk=pk)
        if record.lender != request.user and not request.user.is_staff:
            return Response({'error': 'Only the lending student can confirm the book return.'}, status=status.HTTP_403_FORBIDDEN)

        record.status = 'RETURNED'
        record.lender_confirmed_return = True
        record.actual_return_date = timezone.now()
        record.notes = request.data.get('notes', record.notes)
        record.save()

        # Restore listing to AVAILABLE
        listing = record.listing
        listing.status = 'AVAILABLE'
        listing.save()

        # Complete associated transaction request
        trans_req = record.transaction_request
        trans_req.status = 'COMPLETED'
        trans_req.completed_at = timezone.now()
        trans_req.save()

        # Notify borrower
        Notification.objects.create(
            recipient=record.borrower,
            sender=request.user,
            notification_type='RETURN_CONFIRMED',
            title="Book Return Confirmed",
            message=f"{request.user.get_full_name() or request.user.username} has confirmed the return of '{listing.material.title}'. Thank you!",
            action_url='/borrowing'
        )

        return Response({
            'message': 'Book return confirmed successfully. Item is now marked returned and available for future students.',
            'record': BorrowingRecordSerializer(record).data
        })


class AdminTransactionsListView(generics.ListAPIView):
    """Admin view for monitoring all platform transactions"""
    queryset = TransactionRequest.objects.all().select_related(
        'listing', 'listing__material', 'requester', 'owner'
    ).order_by('-created_at')
    serializer_class = TransactionRequestSerializer
    permission_classes = [IsAdminRole]
