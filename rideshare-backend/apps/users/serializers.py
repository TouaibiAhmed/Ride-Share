from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 
                  'password', 'password_confirm', 'phone_number', 'location')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile display"""
    full_name = serializers.ReadOnlyField()
    rating = serializers.ReadOnlyField()
    reviews_count = serializers.ReadOnlyField()
    total_earnings = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 
                  'full_name', 'avatar', 'bio', 'phone_number', 'location',
                  'is_verified', 'rating', 'reviews_count', 'total_earnings',
                  'rides_given', 'rides_taken', 'total_distance', 'date_joined')
        read_only_fields = ('id', 'email', 'is_verified', 'date_joined', 
                            'rides_given', 'rides_taken', 'total_distance',
                            'total_earnings')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'avatar', 'bio', 
                  'phone_number', 'location')


class UserPublicSerializer(serializers.ModelSerializer):
    """Serializer for public user information (limited fields)"""
    full_name = serializers.ReadOnlyField()
    rating = serializers.ReadOnlyField()
    reviews_count = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'avatar', 'rating', 
                  'reviews_count', 'rides_given', 'is_verified', 'email', 'phone_number')


class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics"""
    full_name = serializers.ReadOnlyField()
    rating = serializers.ReadOnlyField()
    reviews_count = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ('id', 'full_name', 'avatar', 'rating', 'reviews_count',
                  'rides_given', 'rides_taken', 'total_distance', 'date_joined')