from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.rides.models import Ride


class Booking(TimeStampedModel):
    """
    Booking/Request model for passengers to book seats on rides
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]
    
    ride = models.ForeignKey(
        Ride,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    passenger = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings_as_passenger'
    )
    seats = models.IntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    message = models.TextField(blank=True, help_text='Optional message to driver')
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['ride', 'passenger']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['ride', 'status']),
        ]
    
    def __init__(self, *args, **kwargs):
        """Store original status for change detection"""
        super().__init__(*args, **kwargs)
        self._original_status = self.status if self.pk else None
    
    def __str__(self):
        return f"{self.passenger.email} → {self.ride} ({self.status})"
    
    def save(self, *args, **kwargs):
        """Override save to update ride seats when booking is accepted"""
        is_new = self.pk is None
        old_status = None
        
        if not is_new:
            old_booking = Booking.objects.get(pk=self.pk)
            old_status = old_booking.status
        
        super().save(*args, **kwargs)
        
        # Update ride seats when booking status changes to accepted
        if old_status != 'accepted' and self.status == 'accepted':
            self.ride.seats_available -= self.seats
            self.ride.save()
        
        # Restore seats when accepted booking is cancelled
        elif old_status == 'accepted' and self.status == 'cancelled':
            self.ride.seats_available += self.seats
            self.ride.save()