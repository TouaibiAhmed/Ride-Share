from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    BookingListSerializer,
    BookingStatusUpdateSerializer
)


class IsPassengerOrDriver(permissions.BasePermission):
    """
    Permission that allows passengers to view their bookings
    and drivers to view bookings for their rides
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        return obj.passenger == user or obj.ride.driver == user


class BookingCreateView(generics.CreateAPIView):
    """
    POST /api/bookings/ - Create a new booking request
    """
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        response_serializer = BookingSerializer(booking)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class BookingListView(generics.ListAPIView):
    """
    GET /api/bookings/ - List user's bookings
    Query params: ?status=pending&as=passenger (or driver)
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.select_related('ride', 'passenger')
        
        # Filter by role (passenger or driver)
        role = self.request.query_params.get('as', 'passenger')
        if role == 'driver':
            queryset = queryset.filter(ride__driver=user)
        else:
            queryset = queryset.filter(passenger=user)
        
        # Filter by status if provided
        booking_status = self.request.query_params.get('status')
        if booking_status:
            queryset = queryset.filter(status=booking_status)
        
        return queryset


class BookingDetailView(generics.RetrieveDestroyAPIView):
    """
    GET /api/bookings/<id>/ - Get booking details
    DELETE /api/bookings/<id>/ - Cancel booking (passenger only)
    """
    queryset = Booking.objects.select_related('ride', 'passenger')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsPassengerOrDriver]
    
    def destroy(self, request, *args, **kwargs):
        """Cancel booking instead of deleting"""
        booking = self.get_object()
        
        # Only passenger can cancel
        if booking.passenger != request.user:
            raise PermissionDenied("Only passenger can cancel booking")
        
        # Can only cancel pending or accepted bookings
        if booking.status in ['cancelled', 'declined']:
            return Response(
                {'error': 'Booking already cancelled or declined'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        return Response(
            {'message': 'Booking cancelled successfully'},
            status=status.HTTP_200_OK
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def accept_booking(request, pk):
    """
    PATCH /api/bookings/<id>/accept/ - Driver accepts booking
    """
    booking = get_object_or_404(Booking, pk=pk)
    
    # Check if user is the driver
    if booking.ride.driver != request.user:
        raise PermissionDenied("Only the driver can accept bookings")
    
    # Check if booking is pending
    if booking.status != 'pending':
        return Response(
            {'error': 'Can only accept pending bookings'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if enough seats available
    if booking.seats > booking.ride.seats_available:
        return Response(
            {'error': 'Not enough seats available'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    booking.status = 'accepted'
    booking.save()
    
    return Response(
        BookingSerializer(booking).data,
        status=status.HTTP_200_OK
    )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def decline_booking(request, pk):
    """
    PATCH /api/bookings/<id>/decline/ - Driver declines booking
    """
    booking = get_object_or_404(Booking, pk=pk)
    
    # Check if user is the driver
    if booking.ride.driver != request.user:
        raise PermissionDenied("Only the driver can decline bookings")
    
    # Check if booking is pending
    if booking.status != 'pending':
        return Response(
            {'error': 'Can only decline pending bookings'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    booking.status = 'declined'
    booking.save()
    
    return Response(
        BookingSerializer(booking).data,
        status=status.HTTP_200_OK
    )


class MyRequestsView(generics.ListAPIView):
    """
    GET /api/bookings/my-requests/ - Get current user's booking requests
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(
            passenger=self.request.user
        ).select_related('ride', 'passenger')


class RideBookingsView(generics.ListAPIView):
    """
    GET /api/bookings/ride/<ride_id>/ - Get bookings for a specific ride (driver only)
    """
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        ride_id = self.kwargs.get('ride_id')
        return Booking.objects.filter(
            ride_id=ride_id,
            ride__driver=self.request.user
        ).select_related('ride', 'passenger')