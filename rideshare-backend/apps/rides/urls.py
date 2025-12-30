from django.urls import path
from .views import (
    RideListCreateView,
    RideDetailView,
    MyRidesView,
    SearchRidesView,
    CarCreateUpdateView
)

app_name = 'rides'

urlpatterns = [
    path('', RideListCreateView.as_view(), name='ride-list-create'),
    path('search/', SearchRidesView.as_view(), name='ride-search'),
    path('my-rides/', MyRidesView.as_view(), name='my-rides'),
    path('car/', CarCreateUpdateView.as_view(), name='car'),
    path('<int:pk>/', RideDetailView.as_view(), name='ride-detail'),
]