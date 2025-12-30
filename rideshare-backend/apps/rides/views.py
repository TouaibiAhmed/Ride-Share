from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Ride, Car
from .serializers import (
    RideListSerializer,
    RideDetailSerializer,
    RideCreateSerializer,
    RideUpdateSerializer,
    CarSerializer
)
from .filters import RideFilter


class IsDriverOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow drivers to edit their rides
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.driver == request.user


class RideListCreateView(generics.ListCreateAPIView):
    """
    GET /api/rides/ - List all rides with filters
    POST /api/rides/ - Create a new ride
    """
    queryset = Ride.objects.select_related('driver', 'preferences').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = RideFilter
    search_fields = ['origin', 'destination', 'description']
    ordering_fields = ['departure_time', 'price', 'created_at']
    ordering = ['-departure_time']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RideCreateSerializer
        return RideListSerializer
    
    def perform_create(self, serializer):
        serializer.save()


class RideDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/rides/<id>/ - Get ride details
    PUT/PATCH /api/rides/<id>/ - Update ride (driver only)
    DELETE /api/rides/<id>/ - Delete ride (driver only)
    """
    queryset = Ride.objects.select_related('driver', 'preferences').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsDriverOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RideUpdateSerializer
        return RideDetailSerializer
    
    def destroy(self, request, *args, **kwargs):
        """Cancel ride instead of deleting"""
        ride = self.get_object()
        ride.status = 'cancelled'
        ride.save()
        return Response(
            {'message': 'Ride cancelled successfully'},
            status=status.HTTP_200_OK
        )


class MyRidesView(generics.ListAPIView):
    """
    GET /api/rides/my-rides/ - Get current user's rides as driver
    """
    serializer_class = RideListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Ride.objects.filter(
            driver=self.request.user
        ).select_related('driver', 'preferences')


class SearchRidesView(generics.ListAPIView):
    """
    GET /api/rides/search/ - Search rides with query params
    ?origin=Boston&destination=NYC&date=2024-01-15&min_seats=2
    """
    serializer_class = RideListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = RideFilter
    ordering_fields = ['departure_time', 'price']
    ordering = ['departure_time']
    
    def get_queryset(self):
        return Ride.objects.filter(
            status='upcoming'
        ).select_related('driver', 'preferences')


class CarCreateUpdateView(generics.RetrieveUpdateAPIView):
    """
    GET /api/rides/car/ - Get current user's car
    PUT/PATCH /api/rides/car/ - Update current user's car
    """
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get or create car for current user"""
        car, created = Car.objects.get_or_create(user=self.request.user)
        return car