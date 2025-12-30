import React, { useState, useEffect } from 'react';
import { Check, X, MapPin, Calendar, User, MessageSquare, Users } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { Card, CardContent } from '../components/common/Card';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

const RideRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchRideRequests();
    }, []);

    const fetchRideRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch bookings where user is the driver (role=driver)
            const data = await bookingService.getAllBookings({ as: 'driver', status: 'pending' });
            setRequests(data.results || data);
        } catch (err) {
            console.error('Error fetching ride requests:', err);
            setError('Failed to load ride requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (bookingId) => {
        if (!window.confirm('Accept this ride request?')) {
            return;
        }

        try {
            setProcessingId(bookingId);
            await bookingService.accept(bookingId);
            addToast('Ride request accepted successfully!', 'success');

            // Refresh list
            fetchRideRequests();
        } catch (err) {
            console.error('Error accepting request:', err);
            addToast(
                err.response?.data?.error || 'Failed to accept request. Please try again.',
                'error'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (bookingId) => {
        if (!window.confirm('Decline this ride request?')) {
            return;
        }

        try {
            setProcessingId(bookingId);
            await bookingService.decline(bookingId);
            addToast('Ride request declined.', 'info');

            // Refresh list
            fetchRideRequests();
        } catch (err) {
            console.error('Error declining request:', err);
            addToast(
                err.response?.data?.error || 'Failed to decline request. Please try again.',
                'error'
            );
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl text-slate-600">Loading ride requests...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <p className="text-red-600 text-xl mb-4">{error}</p>
                        <Button onClick={fetchRideRequests}>Try Again</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Ride Requests</h1>
                            <p className="text-slate-600 mt-1">
                                Manage booking requests for your rides
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-primary/10 rounded-lg">
                            <span className="text-sm font-medium text-primary">
                                {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-500 text-lg mb-2">
                                        No pending ride requests
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        When passengers request to join your rides, they'll appear here.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            requests.map((booking) => (
                                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Passenger Info */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <Avatar
                                                    src={booking.passenger.avatar}
                                                    alt={booking.passenger.full_name}
                                                    size="lg"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 text-lg mb-1">
                                                        {booking.passenger.full_name}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <User size={14} />
                                                            <span>{booking.passenger.rides_taken} rides taken</span>
                                                        </div>
                                                        {booking.passenger.rating > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-yellow-500">★</span>
                                                                <span>{booking.passenger.rating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Ride Details */}
                                                    <div className="space-y-2 mb-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <MapPin size={14} className="text-slate-400" />
                                                            <span className="text-slate-700">
                                                                {booking.ride.origin} → {booking.ride.destination}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            <span className="text-slate-700">
                                                                {formatDate(booking.ride.departure_time)},{' '}
                                                                {formatTime(booking.ride.departure_time)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Users size={14} className="text-slate-400" />
                                                            <span className="text-slate-700">
                                                                Requesting {booking.seats} seat{booking.seats > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Passenger Message */}
                                                    {booking.message && (
                                                        <div className="bg-slate-50 rounded-lg p-3 mt-3">
                                                            <p className="text-xs text-slate-500 mb-1 font-medium">
                                                                Message from passenger:
                                                            </p>
                                                            <p className="text-sm text-slate-700">
                                                                {booking.message}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex lg:flex-col gap-3 justify-end">
                                                <Button
                                                    onClick={() => handleAccept(booking.id)}
                                                    disabled={processingId === booking.id}
                                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6"
                                                >
                                                    <Check size={18} />
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleDecline(booking.id)}
                                                    disabled={processingId === booking.id}
                                                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 px-6"
                                                >
                                                    <X size={18} />
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RideRequests;
