from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'full_name', 'is_verified', 
                    'rides_given', 'rides_taken', 'rating', 'date_joined')
    list_filter = ('is_verified', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'avatar', 
                                      'bio', 'phone_number', 'location')}),
        ('Statistics', {'fields': ('rides_given', 'rides_taken', 'total_distance')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 
                                    'is_verified', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 
                      'password1', 'password2'),
        }),
    )