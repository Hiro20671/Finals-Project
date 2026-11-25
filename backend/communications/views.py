from django.db.models import Q, Max, Count
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Message, Notification
from .serializers import MessageSerializer, NotificationSerializer


class ConversationsListView(APIView):
    """
    Get all unique conversation partners for the current user,
    with their last message timestamp and unread count.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Find all user IDs involved in conversations with current user
        sent_to = Message.objects.filter(sender=user).values_list('receiver_id', flat=True)
        received_from = Message.objects.filter(receiver=user).values_list('sender_id', flat=True)
        partner_ids = set(list(sent_to) + list(received_from))

        conversations = []
        for pid in partner_ids:
            try:
                partner = User.objects.select_related('student_profile').get(id=pid)
            except User.DoesNotExist:
                continue

            last_msg = Message.objects.filter(
                (Q(sender=user) & Q(receiver=partner)) |
                (Q(sender=partner) & Q(receiver=user))
            ).order_by('-created_at').first()

            unread_count = Message.objects.filter(sender=partner, receiver=user, is_read=False).count()

            avatar = partner.student_profile.display_avatar if hasattr(partner, 'student_profile') else None

            conversations.append({
                'user_id': partner.id,
                'username': partner.username,
                'full_name': partner.get_full_name() or partner.username,
                'avatar': avatar,
                'last_message': last_msg.content if last_msg else '',
                'last_message_time': last_msg.created_at if last_msg else None,
                'unread_count': unread_count,
            })

        conversations.sort(key=lambda x: x['last_message_time'] or '', reverse=True)
        return Response(conversations)


class MessageThreadView(generics.ListAPIView):
    """Retrieve chat history between current user and target user, and mark incoming as read"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        partner_id = self.kwargs.get('user_id')
        partner = get_object_or_404(User, id=partner_id)

        # Mark all messages from partner to current user as read
        Message.objects.filter(sender=partner, receiver=user, is_read=False).update(is_read=True)

        return Message.objects.filter(
            (Q(sender=user) & Q(receiver=partner)) |
            (Q(sender=partner) & Q(receiver=user))
        ).order_by('created_at')


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver')
        receiver = get_object_or_404(User, id=receiver_id)
        msg = serializer.save(sender=self.request.user, receiver=receiver)

        # Notify receiver
        Notification.objects.create(
            recipient=receiver,
            sender=self.request.user,
            notification_type='NEW_MESSAGE',
            title=f"Message from {self.request.user.get_full_name() or self.request.user.username}",
            message=msg.content[:100] + ('...' if len(msg.content) > 100 else ''),
            action_url=f"/messages?user={self.request.user.id}"
        )


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        unread_count = queryset.filter(is_read=False).count()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['unread_count'] = unread_count
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'unread_count': unread_count
        })


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        if pk:
            notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read.'})
        else:
            # Mark all as read
            Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
            return Response({'message': 'All notifications marked as read.'})
