import django_filters
from .models import Ride


class RideFilter(django_filters.FilterSet):
    """Filter for searching rides"""
    
    origin = django_filters.CharFilter(lookup_expr='icontains')
    destination = django_filters.CharFilter(lookup_expr='icontains')
    departure_date = django_filters.DateFilter(
        field_name='departure_time',
        lookup_expr='date'
    )
    departure_date_after = django_filters.DateFilter(
        field_name='departure_time',
        lookup_expr='date__gte'
    )
    min_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='gte'
    )
    max_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='lte'
    )
    min_seats = django_filters.NumberFilter(
        field_name='seats_available',
        lookup_expr='gte'
    )
    instant_booking = django_filters.BooleanFilter()
    status = django_filters.ChoiceFilter(choices=Ride.STATUS_CHOICES)
    
    class Meta:
        model = Ride
        fields = ['origin', 'destination', 'departure_date', 
                  'departure_date_after', 'min_price', 'max_price', 
                  'min_seats', 'instant_booking', 'status']