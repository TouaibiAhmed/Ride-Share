from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.rides.models import Ride
from apps.bookings.models import Booking


class Notification(TimeStampedModel):
    """
    Notification model for user notifications
    """
    
    NOTIFICATION_TYPES = [
        ('ride_request', 'Ride Request'),
        ('request_accepted', 'Request Accepted'),
        ('request_declined', 'Request Declined'),
        ('ride_cancelled', 'Ride Cancelled'),
        ('booking_cancelled', 'Booking Cancelled'),
    ]
    
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications_received'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications_sent',
        null=True,
        blank=True
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related objects
    ride = models.ForeignKey(
        Ride,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Read status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} for {self.recipient.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
