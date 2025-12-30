from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.bookings.models import Booking
from .models import Notification


@receiver(post_save, sender=Booking)
def create_booking_notifications(sender, instance, created, **kwargs):
    """
    Create notifications when booking is created or status changes
    """
    
    # When a new booking is created (ride request)
    if created:
        Notification.objects.create(
            recipient=instance.ride.driver,
            sender=instance.passenger,
            notification_type='ride_request',
            title='New Ride Request',
            message=f'{instance.passenger.full_name} requested {instance.seats} seat(s) for your ride from {instance.ride.origin} to {instance.ride.destination}.',
            ride=instance.ride,
            booking=instance
        )
    
    # When booking status changes
    else:
        # Use the original status tracked in __init__
        old_status = instance._original_status
        
        if old_status is None:
            # Instance wasn't loaded from DB, skip notification
            return
        
        # Check if status changed from pending to accepted
        if old_status == 'pending' and instance.status == 'accepted':
            Notification.objects.create(
                recipient=instance.passenger,
                sender=instance.ride.driver,
                notification_type='request_accepted',
                title='Ride Request Accepted',
                message=f'Your ride request for {instance.ride.origin} to {instance.ride.destination} has been accepted!',
                ride=instance.ride,
                booking=instance
            )
        
        # Check if status changed from pending to declined
        elif old_status == 'pending' and instance.status == 'declined':
            Notification.objects.create(
                recipient=instance.passenger,
                sender=instance.ride.driver,
                notification_type='request_declined',
                title='Ride Request Declined',
                message=f'Your ride request for {instance.ride.origin} to {instance.ride.destination} was declined.',
                ride=instance.ride,
                booking=instance
            )
        
        # Check if accepted booking is cancelled
        elif old_status == 'accepted' and instance.status == 'cancelled':
            Notification.objects.create(
                recipient=instance.ride.driver,
                sender=instance.passenger,
                notification_type='booking_cancelled',
                title='Booking Cancelled',
                message=f'{instance.passenger.full_name} cancelled their booking for your ride from {instance.ride.origin} to {instance.ride.destination}.',
                ride=instance.ride,
                booking=instance
            )
        
        # Update the original status to current after processing
        instance._original_status = instance.status
