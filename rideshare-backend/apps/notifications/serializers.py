from rest_framework import serializers
from .models import Notification
from apps.users.serializers import UserPublicSerializer
from apps.rides.serializers import RideListSerializer
from apps.bookings.serializers import BookingListSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Full notification serializer with nested data"""
    sender = UserPublicSerializer(read_only=True)
    ride = RideListSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = (
            'id', 'recipient', 'sender', 'notification_type',
            'title', 'message', 'ride', 'booking', 'is_read',
            'read_at', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'recipient', 'sender', 'notification_type',
            'title', 'message', 'ride', 'booking', 'read_at',
            'created_at', 'updated_at'
        )


class NotificationListSerializer(serializers.ModelSerializer):
    """Compact notification serializer for lists"""
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_avatar = serializers.ImageField(source='sender.avatar', read_only=True)
    
    class Meta:
        model = Notification
        fields = (
            'id', 'notification_type', 'title', 'message',
            'sender_name', 'sender_avatar', 'is_read',
            'created_at', 'ride', 'booking'
        )
        read_only_fields = fields


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications programmatically"""
    
    class Meta:
        model = Notification
        fields = (
            'recipient', 'sender', 'notification_type',
            'title', 'message', 'ride', 'booking'
        )
