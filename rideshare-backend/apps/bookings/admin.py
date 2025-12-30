from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'passenger', 'ride', 'seats', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('passenger__email', 'ride__origin', 'ride__destination')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Booking Info', {
            'fields': ('ride', 'passenger', 'seats')
        }),
        ('Status', {
            'fields': ('status', 'message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')