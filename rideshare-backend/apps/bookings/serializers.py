from rest_framework import serializers
from .models import Booking
from apps.rides.serializers import RideListSerializer
from apps.users.serializers import UserPublicSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    
    class Meta:
        model = Booking
        fields = ('ride', 'seats', 'message')
    
    def validate(self, data):
        """Validate booking data"""
        ride = data['ride']
        seats = data['seats']
        
        # Check if ride is available
        if ride.status != 'upcoming':
            raise serializers.ValidationError(
                "Cannot book seats on this ride"
            )
        
        # Check if enough seats available
        if seats > ride.seats_available:
            raise serializers.ValidationError(
                f"Only {ride.seats_available} seats available"
            )
        
        # Check if user is not the driver
        user = self.context['request'].user
        if ride.driver == user:
            raise serializers.ValidationError(
                "You cannot book your own ride"
            )
        
        # Check if user already has a booking for this ride
        existing_booking = Booking.objects.filter(
            ride=ride,
            passenger=user
        ).exclude(status='cancelled').first()
        
        if existing_booking:
            raise serializers.ValidationError(
                "You already have a booking for this ride"
            )
        
        return data
    
    def create(self, validated_data):
        """Create booking with passenger from request"""
        validated_data['passenger'] = self.context['request'].user
        
        # Auto-accept if instant booking is enabled
        if validated_data['ride'].instant_booking:
            validated_data['status'] = 'accepted'
        
        return super().create(validated_data)


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for booking details"""
    ride = RideListSerializer(read_only=True)
    passenger = UserPublicSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = ('id', 'ride', 'passenger', 'seats', 'status', 
                  'message', 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')


class BookingListSerializer(serializers.ModelSerializer):
    """Compact serializer for listing bookings"""
    passenger = UserPublicSerializer(read_only=True)
    ride_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ('id', 'passenger', 'ride_info', 'seats', 'status', 
                  'created_at')
    
    def get_ride_info(self, obj):
        """Get basic ride information"""
        return {
            'id': obj.ride.id,
            'origin': obj.ride.origin,
            'destination': obj.ride.destination,
            'departure_time': obj.ride.departure_time,
        }


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating booking status"""
    
    class Meta:
        model = Booking
        fields = ('status',)
    
    def validate_status(self, value):
        """Validate status transition"""
        if value not in ['accepted', 'declined']:
            raise serializers.ValidationError(
                "Status can only be updated to 'accepted' or 'declined'"
            )
        return value