from django.urls import path
from .views import (
    BookingCreateView,
    BookingListView,
    BookingDetailView,
    MyRequestsView,
    RideBookingsView,
    accept_booking,
    decline_booking
)

app_name = 'bookings'

urlpatterns = [
    path('', BookingListView.as_view(), name='booking-list'),
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('my-requests/', MyRequestsView.as_view(), name='my-requests'),
    path('ride/<int:ride_id>/', RideBookingsView.as_view(), name='ride-bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/accept/', accept_booking, name='accept-booking'),
    path('<int:pk>/decline/', decline_booking, name='decline-booking'),
]