from django.db import models
from django.contrib.auth.models import User
from transactions.models import TransactionRequest


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    transaction_request = models.ForeignKey(
        TransactionRequest, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='messages'
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg from {self.sender.username} to {self.receiver.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('REQUEST_RECEIVED', 'New Transaction Request'),
        ('REQUEST_ACCEPTED', 'Request Accepted'),
        ('REQUEST_REJECTED', 'Request Rejected'),
        ('BORROW_CONFIRMED', 'Book Borrowing Handover'),
        ('RETURN_DUE_SOON', 'Borrowing Due Soon'),
        ('RETURN_OVERDUE', 'Return Overdue'),
        ('RETURN_CONFIRMED', 'Book Returned'),
        ('TRANSACTION_COMPLETED', 'Transaction Completed'),
        ('NEW_MESSAGE', 'New Message'),
        ('NEW_REVIEW', 'New Rating & Review'),
        ('LISTING_STATUS', 'Listing Status Update'),
        ('SYSTEM', 'System Announcement'),
    )

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default='SYSTEM')
    title = models.CharField(max_length=200)
    message = models.TextField()
    action_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"
