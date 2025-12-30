from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel


class Ride(TimeStampedModel):
    """Main Ride model"""
    
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Driver
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rides_as_driver'
    )
    
    # Route Information
    origin = models.CharField(max_length=255)
    origin_address = models.CharField(max_length=500, blank=True)
    destination = models.CharField(max_length=255)
    destination_address = models.CharField(max_length=500, blank=True)
    
    # Schedule
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)
    
    # Pricing & Seats
    price = models.DecimalField(max_digits=10, decimal_places=2)
    seats_available = models.IntegerField()
    total_seats = models.IntegerField()
    
    # Additional Details
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='upcoming'
    )
    instant_booking = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-departure_time']
        indexes = [
            models.Index(fields=['origin', 'destination']),
            models.Index(fields=['departure_time']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.origin} → {self.destination} ({self.departure_time.date()})"
    
    @property
    def seats_booked(self):
        """Calculate number of seats already booked"""
        return self.total_seats - self.seats_available
    
    @property
    def is_full(self):
        """Check if ride is fully booked"""
        return self.seats_available == 0


class Car(models.Model):
    """Car information for rides"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='car'
    )
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True)
    year = models.IntegerField(null=True, blank=True)
    license_plate = models.CharField(max_length=20, blank=True)
    car_image = models.ImageField(upload_to='car_images/', blank=True, null=True)
    
    class Meta:
        verbose_name = 'Car'
        verbose_name_plural = 'Cars'
    
    def __str__(self):
        return f"{self.make} {self.model} ({self.year})"


class RidePreferences(models.Model):
    """Preferences for a specific ride"""
    
    ride = models.OneToOneField(
        Ride,
        on_delete=models.CASCADE,
        related_name='preferences'
    )
    smoking_allowed = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)
    music_allowed = models.BooleanField(default=True)
    chat_allowed = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Ride Preferences'
        verbose_name_plural = 'Ride Preferences'
    
    def __str__(self):
        return f"Preferences for {self.ride}"