from django.urls import path
from .views import (
    ConversationsListView,
    MessageThreadView,
    SendMessageView,
    NotificationListView,
    MarkNotificationReadView,
)

urlpatterns = [
    path('conversations/', ConversationsListView.as_view(), name='conversations-list'),
    path('messages/<int:user_id>/', MessageThreadView.as_view(), name='messages-thread'),
    path('messages/send/', SendMessageView.as_view(), name='messages-send'),
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/read-all/', MarkNotificationReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-mark-read'),
]

