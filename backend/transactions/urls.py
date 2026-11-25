from django.urls import path
from .views import (
    CreateTransactionRequestView,
    TransactionRequestListView,
    TransactionRequestDetailView,
    TransactionRequestActionView,
    BorrowingRecordListView,
    ConfirmBookReturnView,
    AdminTransactionsListView,
)

urlpatterns = [
    path('requests/', TransactionRequestListView.as_view(), name='transaction-requests-list'),
    path('requests/create/', CreateTransactionRequestView.as_view(), name='transaction-requests-create'),
    path('requests/<int:pk>/', TransactionRequestDetailView.as_view(), name='transaction-requests-detail'),
    path('requests/<int:pk>/action/', TransactionRequestActionView.as_view(), name='transaction-requests-action'),

    # Borrowing records
    path('borrowings/', BorrowingRecordListView.as_view(), name='borrowings-list'),
    path('borrowings/<int:pk>/return/', ConfirmBookReturnView.as_view(), name='borrowings-confirm-return'),

    # Admin
    path('admin/transactions/', AdminTransactionsListView.as_view(), name='admin-transactions-list'),
]

