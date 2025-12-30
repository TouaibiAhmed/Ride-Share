from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    mark_as_read,
    mark_all_as_read,
    unread_count
)

app_name = 'notifications'

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', unread_count, name='unread-count'),
    path('mark-all-read/', mark_all_as_read, name='mark-all-read'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:pk>/read/', mark_as_read, name='mark-as-read'),
]
