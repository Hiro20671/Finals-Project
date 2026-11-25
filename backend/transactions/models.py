from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from marketplace.models import Listing, AcademicMaterial


class TransactionRequest(models.Model):
    REQUEST_TYPES = (
        ('BUY', 'Purchase Request'),
        ('BORROW', 'Borrowing Request'),
        ('DONATION', 'Donation Claim'),
        ('EXCHANGE', 'Exchange Proposal'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending Owner Approval'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled by Requester'),
        ('IN_PROGRESS', 'In Progress / Handover'),
        ('COMPLETED', 'Completed'),
    )

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='transaction_requests')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_transaction_requests')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_transaction_requests')
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    message = models.TextField(blank=True, help_text="Message from requester regarding schedule or meetup")
    owner_notes = models.TextField(blank=True, help_text="Notes, meetup location, or rejection remarks from owner")

    # For Exchange requests:
    offered_material = models.ForeignKey(
        AcademicMaterial, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='exchange_proposals',
        help_text="The material offered in trade by the requester"
    )
    offered_material_description = models.TextField(blank=True)

    # Financial / Agreement snapshot:
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    meetup_location = models.CharField(max_length=255, blank=True, help_text="e.g. University Library Ground Floor")
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_request_type_display()} #{self.id} for '{self.listing.material.title}' by {self.requester.username} ({self.status})"


class BorrowingRecord(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active / In Borrower Possession'),
        ('RETURNED', 'Returned and Verified'),
        ('OVERDUE', 'Overdue'),
    )

    transaction_request = models.OneToOneField(TransactionRequest, on_delete=models.CASCADE, related_name='borrowing_record')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='borrowing_records')
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowings_as_borrower')
    lender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowings_as_lender')
    borrowed_date = models.DateTimeField(default=timezone.now)
    expected_return_date = models.DateTimeField()
    actual_return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    lender_confirmed_return = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-borrowed_date']

    def __str__(self):
        return f"Borrowing #{self.id}: {self.listing.material.title} ({self.borrower.username} from {self.lender.username})"

    @property
    def is_overdue(self):
        if self.status == 'RETURNED':
            return False
        return timezone.now() > self.expected_return_date


class ExchangeRequest(models.Model):
    """Specific details for academic exchange transactions"""
    transaction_request = models.OneToOneField(TransactionRequest, on_delete=models.CASCADE, related_name='exchange_detail')
    target_material = models.ForeignKey(AcademicMaterial, on_delete=models.CASCADE, related_name='targeted_in_exchanges')
    offered_material = models.ForeignKey(AcademicMaterial, on_delete=models.CASCADE, related_name='offered_in_exchanges')
    exchange_terms = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Exchange: '{self.offered_material.title}' <-> '{self.target_material.title}'"
