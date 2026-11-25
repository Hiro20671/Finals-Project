from django.contrib import admin
from .models import TransactionRequest, BorrowingRecord, ExchangeRequest


@admin.register(TransactionRequest)
class TransactionRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'requester', 'owner', 'request_type', 'status', 'agreed_price', 'created_at')
    list_filter = ('request_type', 'status')
    search_fields = ('listing__material__title', 'requester__username', 'owner__username')


@admin.register(BorrowingRecord)
class BorrowingRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'borrower', 'lender', 'borrowed_date', 'expected_return_date', 'actual_return_date', 'status', 'lender_confirmed_return')
    list_filter = ('status', 'lender_confirmed_return')
    search_fields = ('listing__material__title', 'borrower__username', 'lender__username')


@admin.register(ExchangeRequest)
class ExchangeRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'transaction_request', 'target_material', 'offered_material', 'is_completed', 'created_at')
