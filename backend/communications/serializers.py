from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.serializers import UserSerializer
from .models import Message, Notification


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    receiver_name = serializers.CharField(source='receiver.get_full_name', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'sender',
            'sender_name',
            'sender_username',
            'sender_avatar',
            'receiver',
            'receiver_name',
            'receiver_username',
            'transaction_request',
            'content',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['sender', 'created_at']

    def get_sender_avatar(self, obj):
        if hasattr(obj.sender, 'student_profile'):
            return obj.sender.student_profile.display_avatar
        return None


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'sender',
            'sender_name',
            'sender_username',
            'notification_type',
            'title',
            'message',
            'action_url',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['recipient', 'created_at']

