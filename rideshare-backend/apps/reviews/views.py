from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Review
from .serializers import (
    ReviewCreateSerializer,
    ReviewSerializer,
    ReviewListSerializer
)


class ReviewCreateView(generics.CreateAPIView):
    """
    POST /api/reviews/ - Create a new review
    """
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        
        response_serializer = ReviewSerializer(review)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class ReviewListView(generics.ListAPIView):
    """
    GET /api/reviews/ - List reviews
    Query params:
    - ?user=<user_id> - Get reviews for a specific user (as reviewee)
    - ?ride=<ride_id> - Get reviews for a specific ride
    - ?reviewer=<user_id> - Get reviews given by a specific user
    """
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Review.objects.select_related('reviewer', 'reviewee', 'ride')
        
        # Filter by reviewee (user being reviewed)
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(reviewee_id=user_id)
        
        # Filter by ride
        ride_id = self.request.query_params.get('ride')
        if ride_id:
            queryset = queryset.filter(ride_id=ride_id)
        
        # Filter by reviewer (user who gave the review)
        reviewer_id = self.request.query_params.get('reviewer')
        if reviewer_id:
            queryset = queryset.filter(reviewer_id=reviewer_id)
        
        return queryset


class ReviewDetailView(generics.RetrieveAPIView):
    """
    GET /api/reviews/<id>/ - Get review details
    """
    queryset = Review.objects.select_related('reviewer', 'reviewee', 'ride')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]


class UserReviewsView(generics.ListAPIView):
    """
    GET /api/reviews/user/<user_id>/ - Get all reviews for a specific user
    """
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Review.objects.filter(
            reviewee_id=user_id
        ).select_related('reviewer', 'reviewee', 'ride')


class RideReviewsView(generics.ListAPIView):
    """
    GET /api/reviews/ride/<ride_id>/ - Get all reviews for a specific ride
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        ride_id = self.kwargs.get('ride_id')
        return Review.objects.filter(
            ride_id=ride_id
        ).select_related('reviewer', 'reviewee', 'ride')