from django.urls import path
from .views import (
    ReviewCreateView,
    ReviewListView,
    ReviewDetailView,
    UserReviewsView,
    RideReviewsView
)

app_name = 'reviews'

urlpatterns = [
    path('', ReviewListView.as_view(), name='review-list'),
    path('create/', ReviewCreateView.as_view(), name='review-create'),
    path('user/<int:user_id>/', UserReviewsView.as_view(), name='user-reviews'),
    path('ride/<int:ride_id>/', RideReviewsView.as_view(), name='ride-reviews'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
]