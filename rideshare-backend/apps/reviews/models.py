from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import TimeStampedModel
from apps.rides.models import Ride


class Review(TimeStampedModel):
    """
    Review model for users to rate each other after rides
    """
    ride = models.ForeignKey(
        Ride,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_reviews'
    )
    reviewee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_reviews'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5'
    )
    comment = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['ride', 'reviewer', 'reviewee']
        indexes = [
            models.Index(fields=['reviewee', 'rating']),
        ]
    
    def __str__(self):
        return f"{self.reviewer.email} → {self.reviewee.email} ({self.rating}⭐)"
    
    def save(self, *args, **kwargs):
        """Validate that reviewer and reviewee are different"""
        if self.reviewer == self.reviewee:
            raise ValueError("Cannot review yourself")
        super().save(*args, **kwargs)