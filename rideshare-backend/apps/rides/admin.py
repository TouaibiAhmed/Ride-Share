from django.contrib import admin
from .models import Ride, Car, RidePreferences


class RidePreferencesInline(admin.StackedInline):
    model = RidePreferences
    can_delete = False


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'origin', 'destination', 
                    'departure_time', 'price', 'seats_available', 
                    'status', 'created_at')
    list_filter = ('status', 'instant_booking', 'departure_time')
    search_fields = ('origin', 'destination', 'driver__email')
    date_hierarchy = 'departure_time'
    ordering = ('-departure_time',)
    inlines = [RidePreferencesInline]
    
    fieldsets = (
        ('Driver', {
            'fields': ('driver',)
        }),
        ('Route', {
            'fields': ('origin', 'origin_address', 'destination', 'destination_address')
        }),
        ('Schedule', {
            'fields': ('departure_time', 'arrival_time')
        }),
        ('Pricing & Seats', {
            'fields': ('price', 'total_seats', 'seats_available')
        }),
        ('Details', {
            'fields': ('description', 'status', 'instant_booking')
        }),
    )


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('user', 'make', 'model', 'year', 'color')
    search_fields = ('user__email', 'make', 'model', 'license_plate')
    list_filter = ('make', 'year')


@admin.register(RidePreferences)
class RidePreferencesAdmin(admin.ModelAdmin):
    list_display = ('ride', 'smoking_allowed', 'pets_allowed', 
                    'music_allowed', 'chat_allowed')
    list_filter = ('smoking_allowed', 'pets_allowed', 'music_allowed', 'chat_allowed')