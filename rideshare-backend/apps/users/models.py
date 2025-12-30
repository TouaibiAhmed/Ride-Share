from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import TimeStampedModel

class User(AbstractUser, TimeStampedModel):
    """
    Custom User model extending Django's AbstractUser
    """
    email = models.EmailField(unique=True, verbose_name='Email Address')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False)
    
    # Statistics fields
    rides_given = models.IntegerField(default=0)
    rides_taken = models.IntegerField(default=0)
    total_distance = models.FloatField(default=0.0, help_text='Total distance in kilometers')
    
    # Override username to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def rating(self):
        """Calculate average rating from reviews"""
        reviews = self.received_reviews.all()
        if reviews.exists():
            total = sum(review.rating for review in reviews)
            return round(total / reviews.count(), 1)
        return 0.0
    
    @property
    def reviews_count(self):
        """Count of reviews received"""
        return self.received_reviews.count()

    @property
    def total_earnings(self):
        """Calculate total earnings from accepted bookings of rides driven"""
        from apps.bookings.models import Booking
        # We need to import Ride as well or use F expression correctly
        return Booking.objects.filter(
            ride__driver=self,
            status='accepted'
        ).aggregate(
            total=models.Sum(models.F('seats') * models.F('ride__price'))
        )['total'] or 0.0