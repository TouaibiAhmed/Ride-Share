from rest_framework import serializers
from .models import Ride, Car, RidePreferences
from apps.users.serializers import UserPublicSerializer


class CarSerializer(serializers.ModelSerializer):
    """Serializer for Car model"""
    
    class Meta:
        model = Car
        fields = ('id', 'make', 'model', 'color', 'year', 'license_plate', 'car_image')
        read_only_fields = ('id',)


class RidePreferencesSerializer(serializers.ModelSerializer):
    """Serializer for Ride Preferences"""
    
    class Meta:
        model = RidePreferences
        fields = ('smoking_allowed', 'pets_allowed', 'music_allowed', 'chat_allowed')


class RideListSerializer(serializers.ModelSerializer):
    """Serializer for listing rides (compact view)"""
    driver = UserPublicSerializer(read_only=True)
    seats_booked = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Ride
        fields = ('id', 'driver', 'origin', 'destination', 'departure_time', 
                  'price', 'seats_available', 'total_seats', 'seats_booked', 
                  'is_full', 'status', 'instant_booking')


class RideDetailSerializer(serializers.ModelSerializer):
    """Serializer for ride details (full view)"""
    driver = UserPublicSerializer(read_only=True)
    preferences = RidePreferencesSerializer(required=False)
    car = serializers.SerializerMethodField()
    seats_booked = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Ride
        fields = ('id', 'driver', 'origin', 'origin_address', 'destination', 
                  'destination_address', 'departure_time', 'arrival_time', 
                  'price', 'seats_available', 'total_seats', 'seats_booked',
                  'is_full', 'description', 'status', 'instant_booking', 
                  'preferences', 'car', 'created_at', 'updated_at')
        read_only_fields = ('id', 'driver', 'created_at', 'updated_at')
    
    def get_car(self, obj):
        """Get driver's car information"""
        if hasattr(obj.driver, 'car'):
            return CarSerializer(obj.driver.car).data
        return None


class RideCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating rides"""
    preferences = RidePreferencesSerializer(required=False)
    
    class Meta:
        model = Ride
        fields = ('origin', 'origin_address', 'destination', 'destination_address',
                  'departure_time', 'arrival_time', 'price', 'seats_available',
                  'total_seats', 'description', 'instant_booking', 'preferences')
    
    def validate(self, data):
        """Validate ride data"""
        if data['seats_available'] > data['total_seats']:
            raise serializers.ValidationError(
                "Available seats cannot exceed total seats"
            )
        
        if data['seats_available'] < 1:
            raise serializers.ValidationError(
                "Must have at least 1 available seat"
            )
        
        if data['price'] < 0:
            raise serializers.ValidationError(
                "Price cannot be negative"
            )
        
        return data
    
    def create(self, validated_data):
        """Create ride with preferences"""
        preferences_data = validated_data.pop('preferences', None)
        
        # Set driver from request context
        validated_data['driver'] = self.context['request'].user
        
        ride = Ride.objects.create(**validated_data)
        
        # Create preferences if provided
        if preferences_data:
            RidePreferences.objects.create(ride=ride, **preferences_data)
        else:
            # Create default preferences
            RidePreferences.objects.create(ride=ride)
        
        return ride


class RideUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating rides"""
    preferences = RidePreferencesSerializer(required=False)
    
    class Meta:
        model = Ride
        fields = ('origin', 'origin_address', 'destination', 'destination_address',
                  'departure_time', 'arrival_time', 'price', 'seats_available',
                  'description', 'instant_booking', 'status', 'preferences')
    
    def update(self, instance, validated_data):
        """Update ride and preferences"""
        preferences_data = validated_data.pop('preferences', None)
        
        # Update ride fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update preferences if provided
        if preferences_data:
            if hasattr(instance, 'preferences'):
                for attr, value in preferences_data.items():
                    setattr(instance.preferences, attr, value)
                instance.preferences.save()
            else:
                RidePreferences.objects.create(ride=instance, **preferences_data)
        
        return instance