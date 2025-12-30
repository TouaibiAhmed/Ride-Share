import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, Clock, User, Star, Shield, MessageCircle,
    Info, CheckCircle, Car, AlertCircle, X, Edit, Users, Check, X as XIcon
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { formatCurrency, formatTime, formatDate } from '../utils/helpers';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';

const RideDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isEditRideModalOpen, setIsEditRideModalOpen] = useState(false);
    const [isViewBookingsModalOpen, setIsViewBookingsModalOpen] = useState(false);
    const [isContactDriverModalOpen, setIsContactDriverModalOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [updatingBooking, setUpdatingBooking] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: ''
    });
    const [myBooking, setMyBooking] = useState(null);
    const [bookingData, setBookingData] = useState({
        seats: 1,
        message: ''
    });
    const [editRideData, setEditRideData] = useState({
        origin: '',
        destination: '',
        departure_time: '',
        price: 0,
        seats_available: 0,
        description: '',
        preferences: {
            smoking_allowed: false,
            pets_allowed: false,
            music_allowed: false,
            chat_allowed: false
        }
    });
    const [submitting, setSubmitting] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchRideDetails();
    }, [id]);

    useEffect(() => {
        if (ride) {
            setEditRideData({
                origin: ride.origin || '',
                destination: ride.destination || '',
                departure_time: ride.departure_time ? ride.departure_time.split('T')[0] : '',
                price: ride.price || 0,
                seats_available: ride.seats_available || 0,
                description: ride.description || '',
                preferences: ride.preferences || {
                    smoking_allowed: false,
                    pets_allowed: false,
                    music_allowed: false,
                    chat_allowed: false
                }
            });
        }
    }, [ride]);

    const fetchRideDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await rideService.getById(id);
            setRide(response);

            // If user is logged in, find their booking for this ride
            if (currentUser.id) {
                const response = await bookingService.getAllBookings({ ride: id, as: 'passenger' });
                const userBookings = response.results ?? response;
                const currentBooking = userBookings.find(b => b.ride.id === parseInt(id));
                setMyBooking(currentBooking);
            }
        } catch (err) {
            console.error('Error fetching ride details:', err);
            setError('Failed to load ride details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setBookingsLoading(true);
            const response = await bookingService.getRideBookings(id);
            const bookingResults = response.results ?? response;
            setBookings(bookingResults);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            alert('Failed to load bookings. Please try again.');
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleBookingSubmit = async () => {
        try {
            setSubmitting(true);

            const bookingPayload = {
                ride: parseInt(id),
                seats: bookingData.seats,
                message: bookingData.message
            };

            console.log('Sending booking request:', bookingPayload);
            console.log('Current user:', localStorage.getItem('user'));
            console.log('Auth token exists:', !!localStorage.getItem('token'));

            await bookingService.create(bookingPayload);
            alert('Booking request sent successfully!');
            setIsBookingModalOpen(false);
            // Refresh ride details to update available seats
            fetchRideDetails();
        } catch (err) {
            console.error('Error creating booking:', err);
            console.error('Error response:', err.response?.data);

            // Show detailed error message
            const errorMessage = err.response?.data?.message
                || err.response?.data?.error
                || err.response?.data?.detail
                || JSON.stringify(err.response?.data)
                || 'Failed to send booking request. Please try again.';

            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditRideSubmit = async () => {
        try {
            setUpdating(true);
            const formattedData = {
                ...editRideData,
                departure_time: editRideData.departure_time + 'T00:00:00Z'
            };
            await rideService.update(id, formattedData);
            alert('Ride updated successfully!');
            setIsEditRideModalOpen(false);
            fetchRideDetails();
        } catch (err) {
            console.error('Error updating ride:', err);
            alert(err.response?.data?.message || 'Failed to update ride. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleAcceptBooking = async (bookingId) => {
        try {
            setUpdatingBooking(bookingId);
            await bookingService.accept(bookingId);
            alert('Booking accepted!');
            fetchBookings();
            fetchRideDetails(); // Refresh ride to update available seats
        } catch (err) {
            console.error('Error accepting booking:', err);
            alert(err.response?.data?.message || 'Failed to accept booking. Please try again.');
        } finally {
            setUpdatingBooking(null);
        }
    };

    const handleDeclineBooking = async (bookingId) => {
        try {
            setUpdatingBooking(bookingId);
            await bookingService.decline(bookingId);
            alert('Booking declined!');
            fetchBookings();
        } catch (err) {
            console.error('Error declining booking:', err);
            alert(err.response?.data?.message || 'Failed to decline booking. Please try again.');
        } finally {
            setUpdatingBooking(null);
        }
    };

    const handleReviewSubmit = async () => {
        try {
            setSubmitting(true);
            const reviewPayload = {
                ride: parseInt(id),
                reviewee: ride.driver.id,
                rating: reviewData.rating,
                comment: reviewData.comment
            };
            await reviewService.create(reviewPayload);
            alert('Review submitted successfully!');
            setIsReviewModalOpen(false);
            fetchRideDetails();
        } catch (err) {
            console.error('Error submitting review:', err);
            alert(err.response?.data?.message || err.response?.data?.non_field_errors?.[0] || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const openViewBookingsModal = () => {
        setIsViewBookingsModalOpen(true);
        fetchBookings();
    };

    // Check if current user is the driver of this ride
    const isDriver = ride && currentUser.id && ride.driver.id === currentUser.id;

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'declined': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Check if user has an accepted booking
    const isAcceptedPassenger = myBooking && myBooking.status === 'accepted';

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">Loading ride details...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !ride) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Ride not found</h2>
                        <p className="text-slate-600 mt-2">{error || 'The ride you are looking for does not exist or has been removed.'}</p>
                        <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Ride Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                                    {formatDate(ride.departure_time)}
                                </h1>

                                <div className="mt-8 relative pl-8 border-l-2 border-slate-200 space-y-12">
                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-0 bg-white border-2 border-slate-900 rounded-full p-1.5">
                                            <div className="w-3 h-3 bg-slate-900 rounded-full" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-slate-900">{formatTime(ride.departure_time)}</span>
                                            <span className="text-lg font-medium text-slate-700">{ride.origin}</span>
                                            {ride.origin_address && (
                                                <span className="text-slate-500 text-sm">{ride.origin_address}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-0 bg-white border-2 border-success rounded-full p-1.5">
                                            <div className="w-3 h-3 bg-success rounded-full" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold text-slate-900">
                                                {ride.arrival_time ? formatTime(ride.arrival_time) : 'TBD'}
                                            </span>
                                            <span className="text-lg font-medium text-slate-700">{ride.destination}</span>
                                            {ride.destination_address && (
                                                <span className="text-slate-500 text-sm">{ride.destination_address}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="text-slate-600">Total Price for 1 passenger</div>
                                        <div className="text-3xl font-bold text-primary">{formatCurrency(ride.price)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Info */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">Your Driver</h3>
                                            <div className="flex items-center mt-2">
                                                <Link to={`/profile/${ride.driver.id}`} className="text-xl font-medium text-primary hover:underline">
                                                    {ride.driver.first_name} {ride.driver.last_name}
                                                </Link>
                                                {ride.driver.is_verified && (
                                                    <Shield size={16} className="ml-2 text-success fill-success/20" />
                                                )}
                                            </div>
                                            {ride.driver.rating && (
                                                <div className="flex items-center mt-1 text-sm text-slate-500">
                                                    <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                                                    <span className="font-medium text-slate-900 mr-1">{ride.driver.rating}</span>
                                                    <span>/ 5 {ride.driver.reviews_count ? `• ${ride.driver.reviews_count} reviews` : ''}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Avatar src={ride.driver.avatar} size="lg" />
                                    </div>

                                    {ride.description && (
                                        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                            <p className="text-slate-600 italic">"{ride.description}"</p>
                                        </div>
                                    )}

                                    <div className="mt-6 flex gap-4">
                                        {isAcceptedPassenger && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsContactDriverModalOpen(true)}
                                            >
                                                <MessageCircle size={16} className="mr-2" /> Contact Driver
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Car Info */}
                            {ride.car && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Car Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Car Image */}
                                        {ride.car.car_image && (
                                            <div className="mb-4">
                                                <img
                                                    src={ride.car.car_image}
                                                    alt={`${ride.car.make} ${ride.car.model}`}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {!ride.car.car_image && (
                                                <div className="p-3 bg-blue-50 text-primary rounded-lg">
                                                    <Car size={24} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-slate-900">{ride.car.make} {ride.car.model}</div>
                                                <div className="text-sm text-slate-500">{ride.car.color} • {ride.car.year}</div>
                                            </div>
                                        </div>

                                        {ride.preferences && (
                                            <div className="mt-6 grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    {ride.preferences.smoking_allowed ?
                                                        <CheckCircle size={16} className="text-success" /> :
                                                        <AlertCircle size={16} className="text-slate-400" />
                                                    }
                                                    <span>Smoking {ride.preferences.smoking_allowed ? 'Allowed' : 'Not Allowed'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    {ride.preferences.pets_allowed ?
                                                        <CheckCircle size={16} className="text-success" /> :
                                                        <AlertCircle size={16} className="text-slate-400" />
                                                    }
                                                    <span>Pets {ride.preferences.pets_allowed ? 'Allowed' : 'Not Allowed'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    {ride.preferences.music_allowed ?
                                                        <CheckCircle size={16} className="text-success" /> :
                                                        <AlertCircle size={16} className="text-slate-400" />
                                                    }
                                                    <span>Music {ride.preferences.music_allowed ? 'Allowed' : 'Not Allowed'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    {ride.preferences.chat_allowed ?
                                                        <CheckCircle size={16} className="text-success" /> :
                                                        <AlertCircle size={16} className="text-slate-400" />
                                                    }
                                                    <span>Chat {ride.preferences.chat_allowed ? 'Allowed' : 'Not Allowed'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Booking Action */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <Card className="border-t-4 border-t-primary">
                                    <CardContent className="pt-6">
                                        <div className="text-center mb-6">
                                            <div className="text-sm text-slate-500 mb-1">Price per seat</div>
                                            <div className="text-4xl font-bold text-slate-900">{formatCurrency(ride.price)}</div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Seats available</span>
                                                <span className="font-medium text-slate-900">{ride.seats_available}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Service fee</span>
                                                <span className="font-medium text-slate-900">{formatCurrency(2.50)}</span>
                                            </div>
                                            <div className="border-t border-slate-100 pt-4 flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>{formatCurrency(ride.price + 2.50)}</span>
                                            </div>
                                        </div>

                                        {/* Only show booking button if user is NOT the driver */}
                                        {!isDriver ? (
                                            <>
                                                {ride.seats_available > 0 && ride.status === 'upcoming' ? (
                                                    <Button
                                                        className="w-full h-12 text-lg shadow-lg shadow-primary/20"
                                                        onClick={() => setIsBookingModalOpen(true)}
                                                    >
                                                        {ride.instant_booking ? 'Book Instantly' : 'Request to Book'}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="w-full h-12 text-lg"
                                                        disabled
                                                    >
                                                        {ride.status !== 'upcoming' ? 'Ride Not Available' : 'No Seats Available'}
                                                    </Button>
                                                )}

                                                <p className="text-xs text-center text-slate-400 mt-4">
                                                    {ride.instant_booking
                                                        ? 'Your booking will be confirmed immediately.'
                                                        : "You won't be charged until the driver accepts your request."
                                                    }
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                                    <p className="text-blue-900 font-medium">This is your ride</p>
                                                </div>
                                                <div className="flex flex-col gap-2 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => setIsEditRideModalOpen(true)}
                                                    >
                                                        <Edit size={16} className="mr-2" />
                                                        Edit Ride
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={openViewBookingsModal}
                                                    >
                                                        <Users size={16} className="mr-2" />
                                                        View Bookings
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        {/* Leave Review Button for accepted passengers */}
                                        {isAcceptedPassenger && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                                                    onClick={() => setIsReviewModalOpen(true)}
                                                >
                                                    <Star size={16} className="mr-2 fill-yellow-400 text-yellow-400" />
                                                    Rate Your Experience
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                                    <Info className="text-primary shrink-0" size={20} />
                                    <p className="text-sm text-blue-900">
                                        <strong>Safety Tip:</strong> Always communicate through the app and verify the car details before entering.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <Modal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title={ride.instant_booking ? 'Book Instantly' : 'Request to Book'}
            >
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-medium text-slate-900 mb-2">Trip Summary</h4>
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                            <span>{ride.origin} → {ride.destination}</span>
                            <span>{formatDate(ride.departure_time)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Number of seats
                        </label>
                        <select
                            className="w-full rounded-md border-slate-300 focus:ring-primary"
                            value={bookingData.seats}
                            onChange={(e) => setBookingData({ ...bookingData, seats: parseInt(e.target.value) })}
                        >
                            {[...Array(ride.seats_available)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1} seat{i > 0 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Message to driver (optional)
                        </label>
                        <textarea
                            className="w-full rounded-md border-slate-300 focus:ring-primary h-24 resize-none"
                            placeholder="Hi! I'm interested in your ride..."
                            value={bookingData.message}
                            onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Price ({bookingData.seats} seat{bookingData.seats > 1 ? 's' : ''})</span>
                            <span className="font-medium">{formatCurrency(ride.price * bookingData.seats)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Service fee</span>
                            <span className="font-medium">{formatCurrency(2.50)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                            <span>Total</span>
                            <span>{formatCurrency(ride.price * bookingData.seats + 2.50)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setIsBookingModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleBookingSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Sending...' : 'Send Request'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Ride Modal */}
            <Modal
                isOpen={isEditRideModalOpen}
                onClose={() => setIsEditRideModalOpen(false)}
                title="Edit Ride"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Origin
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border-slate-300 focus:ring-primary"
                                value={editRideData.origin}
                                onChange={(e) => setEditRideData({ ...editRideData, origin: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Destination
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border-slate-300 focus:ring-primary"
                                value={editRideData.destination}
                                onChange={(e) => setEditRideData({ ...editRideData, destination: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Departure Date
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border-slate-300 focus:ring-primary"
                                value={editRideData.departure_time}
                                onChange={(e) => setEditRideData({ ...editRideData, departure_time: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Price per seat ($)
                            </label>
                            <input
                                type="number"
                                className="w-full rounded-md border-slate-300 focus:ring-primary"
                                value={editRideData.price}
                                onChange={(e) => setEditRideData({ ...editRideData, price: parseFloat(e.target.value) })}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Available Seats
                        </label>
                        <input
                            type="number"
                            className="w-full rounded-md border-slate-300 focus:ring-primary"
                            value={editRideData.seats_available}
                            onChange={(e) => setEditRideData({ ...editRideData, seats_available: parseInt(e.target.value) })}
                            min="1"
                            max="10"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            className="w-full rounded-md border-slate-300 focus:ring-primary h-24 resize-none"
                            placeholder="Tell passengers about your ride..."
                            value={editRideData.description}
                            onChange={(e) => setEditRideData({ ...editRideData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Preferences</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editRideData.preferences.smoking_allowed}
                                    onChange={(e) => setEditRideData({
                                        ...editRideData,
                                        preferences: {
                                            ...editRideData.preferences,
                                            smoking_allowed: e.target.checked
                                        }
                                    })}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-700">Smoking Allowed</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editRideData.preferences.pets_allowed}
                                    onChange={(e) => setEditRideData({
                                        ...editRideData,
                                        preferences: {
                                            ...editRideData.preferences,
                                            pets_allowed: e.target.checked
                                        }
                                    })}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-700">Pets Allowed</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editRideData.preferences.music_allowed}
                                    onChange={(e) => setEditRideData({
                                        ...editRideData,
                                        preferences: {
                                            ...editRideData.preferences,
                                            music_allowed: e.target.checked
                                        }
                                    })}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-700">Music Allowed</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editRideData.preferences.chat_allowed}
                                    onChange={(e) => setEditRideData({
                                        ...editRideData,
                                        preferences: {
                                            ...editRideData.preferences,
                                            chat_allowed: e.target.checked
                                        }
                                    })}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-700">Chat Allowed</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setIsEditRideModalOpen(false)}
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleEditRideSubmit}
                            disabled={updating}
                        >
                            {updating ? 'Updating...' : 'Update Ride'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Bookings Modal */}
            <Modal
                isOpen={isViewBookingsModalOpen}
                onClose={() => setIsViewBookingsModalOpen(false)}
                title="Ride Bookings"
                size="xl"
            >
                <div className="space-y-4">
                    {bookingsLoading ? (
                        <div className="text-center py-8">
                            <div className="text-slate-500">Loading bookings...</div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-8">
                            <Users size={48} className="mx-auto text-slate-300 mb-3" />
                            <div className="text-slate-500">No bookings yet</div>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <Avatar src={booking.passenger.avatar} />
                                            <div>
                                                <div className="font-medium text-slate-900">
                                                    {booking.passenger.full_name || booking.passenger.username}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {booking.seats} seat{booking.seats > 1 ? 's' : ''} • {formatCurrency(ride.price * booking.seats)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.status)}`}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </div>

                                    {booking.message && (
                                        <div className="mb-3 p-3 bg-white rounded border border-slate-200">
                                            <p className="text-sm text-slate-700">{booking.message}</p>
                                        </div>
                                    )}

                                    <div className="text-sm text-slate-500 mb-3">
                                        Booked on {formatDate(booking.created_at)}
                                    </div>

                                    {booking.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => handleDeclineBooking(booking.id)}
                                                disabled={updatingBooking === booking.id}
                                            >
                                                <XIcon size={14} className="mr-1" />
                                                Decline
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleAcceptBooking(booking.id)}
                                                disabled={updatingBooking === booking.id}
                                            >
                                                <Check size={14} className="mr-1" />
                                                Accept
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Total Bookings:</span>
                            <span className="font-medium">{bookings.length}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 mt-1">
                            <span>Available Seats:</span>
                            <span className="font-medium">{ride.seats_available}</span>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Review Modal */}
            <Modal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                title="Rate Your Ride"
            >
                <div className="space-y-6">
                    <div className="text-center">
                        <Avatar src={ride.driver.avatar} size="lg" className="mx-auto mb-3" />
                        <h4 className="font-semibold text-slate-900">Driver: {ride.driver.full_name || `${ride.driver.first_name} ${ride.driver.last_name}`}</h4>
                        <p className="text-sm text-slate-500">{ride.origin} → {ride.destination}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                            Your Rating
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        className={`${star <= reviewData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Comment (Optional)
                        </label>
                        <textarea
                            className="w-full rounded-md border-slate-300 focus:ring-primary h-32 resize-none"
                            placeholder="How was your trip? Shared costs, comfort, punctuality..."
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setIsReviewModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleReviewSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Contact Driver Modal */}
            <Modal
                isOpen={isContactDriverModalOpen}
                onClose={() => setIsContactDriverModalOpen(false)}
                title="Contact Driver"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-900 mb-4">
                            <Info className="inline" size={16} /> You can contact the driver using the information below:
                        </p>

                        <div className="space-y-3">
                            {ride?.driver?.email && (
                                <div className="bg-white p-3 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">Email</div>
                                    <div className="font-medium text-slate-900">{ride.driver.email}</div>
                                </div>
                            )}

                            {ride?.driver?.phone_number && (
                                <div className="bg-white p-3 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">Phone Number</div>
                                    <div className="font-medium text-slate-900">{ride.driver.phone_number}</div>
                                </div>
                            )}

                            {!ride?.driver?.email && !ride?.driver?.phone_number && (
                                <div className="text-center text-slate-500 py-4">
                                    No contact information available
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsContactDriverModalOpen(false)}
                    >
                        Close
                    </Button>
                </div>
            </Modal>
        </Layout>
    );
};

export default RideDetailsPage;