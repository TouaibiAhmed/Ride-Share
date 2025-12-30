from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer
)


class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/ - List user's notifications
    Query params: ?type=ride_request&is_read=false
    """
    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(recipient=user).select_related(
            'sender', 'ride', 'booking'
        )
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        return queryset


class NotificationDetailView(generics.RetrieveAPIView):
    """
    GET /api/notifications/<id>/ - Get notification details
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender', 'ride', 'booking')


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def mark_as_read(request, pk):
    """
    PATCH /api/notifications/<id>/read/ - Mark notification as read
    """
    notification = get_object_or_404(
        Notification,
        pk=pk,
        recipient=request.user
    )
    
    notification.mark_as_read()
    
    return Response(
        NotificationSerializer(notification).data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_as_read(request):
    """
    POST /api/notifications/mark-all-read/ - Mark all notifications as read
    """
    from django.utils import timezone
    
    updated_count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response(
        {'message': f'{updated_count} notifications marked as read'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """
    GET /api/notifications/unread-count/ - Get count of unread notifications
    """
    count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()
    
    return Response(
        {'count': count},
        status=status.HTTP_200_OK
    )
