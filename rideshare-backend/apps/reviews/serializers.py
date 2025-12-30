from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserPublicSerializer


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = Review
        fields = ('ride', 'reviewee', 'rating', 'comment')
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate(self, data):
        """Validate review data"""
        user = self.context['request'].user
        ride = data['ride']
        reviewee = data['reviewee']
        
        # Check if user was part of this ride
        was_driver = ride.driver == user
        was_passenger = ride.bookings.filter(
            passenger=user,
            status='accepted'
        ).exists()
        
        if not (was_driver or was_passenger):
            raise serializers.ValidationError(
                "You must be a participant of this ride to leave a review"
            )
        
        # Check if reviewee was part of the ride
        reviewee_was_driver = ride.driver == reviewee
        reviewee_was_passenger = ride.bookings.filter(
            passenger=reviewee,
            status='accepted'
        ).exists()
        
        if not (reviewee_was_driver or reviewee_was_passenger):
            raise serializers.ValidationError(
                "Reviewee must be a participant of this ride"
            )
        
        # Check if user already reviewed this person for this ride
        existing_review = Review.objects.filter(
            ride=ride,
            reviewer=user,
            reviewee=reviewee
        ).first()
        
        if existing_review:
            raise serializers.ValidationError(
                "You have already reviewed this user for this ride"
            )
        
        # Cannot review yourself
        if user == reviewee:
            raise serializers.ValidationError(
                "Cannot review yourself"
            )
        
        return data
    
    def create(self, validated_data):
        """Create review with reviewer from request"""
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for review display"""
    reviewer = UserPublicSerializer(read_only=True)
    reviewee = UserPublicSerializer(read_only=True)
    ride_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ('id', 'ride', 'ride_info', 'reviewer', 'reviewee', 
                  'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def get_ride_info(self, obj):
        """Get basic ride information"""
        return {
            'id': obj.ride.id,
            'origin': obj.ride.origin,
            'destination': obj.ride.destination,
            'departure_time': obj.ride.departure_time,
        }


class ReviewListSerializer(serializers.ModelSerializer):
    """Compact serializer for listing reviews"""
    reviewer = UserPublicSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'reviewer', 'rating', 'comment', 'created_at')