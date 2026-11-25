from rest_framework import serializers
from django.contrib.auth.models import User
from marketplace.serializers import ListingSerializer, AcademicMaterialSerializer
from marketplace.models import Listing, AcademicMaterial
from .models import TransactionRequest, BorrowingRecord, ExchangeRequest


class TransactionRequestSerializer(serializers.ModelSerializer):
    listing_details = ListingSerializer(source='listing', read_only=True)
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    requester_avatar = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    offered_material_details = AcademicMaterialSerializer(source='offered_material', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    has_borrowing_record = serializers.SerializerMethodField()

    class Meta:
        model = TransactionRequest
        fields = [
            'id',
            'listing',
            'listing_details',
            'requester',
            'requester_name',
            'requester_username',
            'requester_avatar',
            'owner',
            'owner_name',
            'owner_username',
            'request_type',
            'request_type_display',
            'status',
            'status_display',
            'message',
            'owner_notes',
            'offered_material',
            'offered_material_details',
            'offered_material_description',
            'agreed_price',
            'meetup_location',
            'has_borrowing_record',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['requester', 'owner', 'status', 'completed_at', 'created_at', 'updated_at']

    def get_requester_avatar(self, obj):
        if hasattr(obj.requester, 'student_profile'):
            return obj.requester.student_profile.display_avatar
        return None

    def get_has_borrowing_record(self, obj):
        return hasattr(obj, 'borrowing_record')


class CreateTransactionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionRequest
        fields = [
            'listing',
            'request_type',
            'message',
            'offered_material',
            'offered_material_description',
            'meetup_location',
        ]

    def validate(self, data):
        user = self.context['request'].user
        listing = data.get('listing')

        if listing.material.owner == user:
            raise serializers.ValidationError("You cannot create a transaction request on your own listing.")

        if listing.status != 'AVAILABLE':
            raise serializers.ValidationError(f"This listing is currently {listing.get_status_display()} and not open for new requests.")

        # Check for existing pending request by same user
        existing_pending = TransactionRequest.objects.filter(
            listing=listing,
            requester=user,
            status='PENDING'
        ).exists()
        if existing_pending:
            raise serializers.ValidationError("You already have an active pending request for this item.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        listing = validated_data['listing']

        transaction = TransactionRequest.objects.create(
            requester=user,
            owner=listing.material.owner,
            agreed_price=listing.price,
            **validated_data
        )
        return transaction


class BorrowingRecordSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source='listing.material.title', read_only=True)
    borrower_name = serializers.CharField(source='borrower.get_full_name', read_only=True)
    borrower_username = serializers.CharField(source='borrower.username', read_only=True)
    lender_name = serializers.CharField(source='lender.get_full_name', read_only=True)
    lender_username = serializers.CharField(source='lender.username', read_only=True)
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = BorrowingRecord
        fields = [
            'id',
            'transaction_request',
            'listing',
            'listing_title',
            'borrower',
            'borrower_name',
            'borrower_username',
            'lender',
            'lender_name',
            'lender_username',
            'borrowed_date',
            'expected_return_date',
            'actual_return_date',
            'status',
            'lender_confirmed_return',
            'is_overdue',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['borrower', 'lender', 'borrowed_date', 'actual_return_date', 'created_at', 'updated_at']

