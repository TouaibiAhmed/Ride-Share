import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight, User, MoreVertical } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';
import { ROUTES } from '../utils/constants';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';

const MyRides = () => {
    const [activeTab, setActiveTab] = useState('driver'); // 'driver' or 'passenger'
    const [offeredRides, setOfferedRides] = useState([]);
    const [bookedRides, setBookedRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyRides();
    }, []);

    const fetchMyRides = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch rides offered by the user (as driver)
            const offeredResponse = await rideService.getMyRides();
            setOfferedRides(offeredResponse.results || offeredResponse);

            // Fetch rides booked by the user (as passenger)
            const bookedResponse = await bookingService.getMyRequests();
            setBookedRides(bookedResponse.results || bookedResponse);

        } catch (err) {
            console.error('Error fetching rides:', err);
            setError('Failed to load your rides. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRide = async (rideId) => {
        if (!window.confirm('Are you sure you want to cancel this ride?')) {
            return;
        }

        try {
            await rideService.delete(rideId);
            // Refresh the list
            fetchMyRides();
        } catch (err) {
            console.error('Error canceling ride:', err);
            alert('Failed to cancel ride. Please try again.');
        }
    };

    // Get rides based on active tab
    const rides = activeTab === 'driver' ? offeredRides : bookedRides;

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-xl">Loading your rides...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-red-600 text-xl">{error}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h1 className="text-2xl font-bold text-slate-900">My Rides</h1>
                        <Link to={ROUTES.CREATE_RIDE}>
                            <Button>Post a New Ride</Button>
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-8">
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                                activeTab === 'driver' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                            }`}
                            onClick={() => setActiveTab('driver')}
                        >
                            Rides I'm Offering ({offeredRides.length})
                            {activeTab === 'driver' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                                activeTab === 'passenger' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                            }`}
                            onClick={() => setActiveTab('passenger')}
                        >
                            Rides I've Booked ({bookedRides.length})
                            {activeTab === 'passenger' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {rides.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                                <p className="text-slate-500 text-lg">No rides found.</p>
                                {activeTab === 'passenger' ? (
                                    <Link to={ROUTES.SEARCH}>
                                        <Button variant="outline" className="mt-4">Find a Ride</Button>
                                    </Link>
                                ) : (
                                    <Link to={ROUTES.CREATE_RIDE}>
                                        <Button variant="outline" className="mt-4">Create a Ride</Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            rides.map((item) => {
                                // For driver tab: item is a ride object
                                // For passenger tab: item is a booking object with nested ride
                                const isDriverTab = activeTab === 'driver';
                                const ride = isDriverTab ? item : item.ride;
                                const booking = isDriverTab ? null : item;

                                return (
                                    <Card key={isDriverTab ? ride.id : booking.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Date Box */}
                                                <div className="flex flex-row md:flex-col items-center justify-center p-4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 min-w-[120px] gap-2 md:gap-0">
                                                    <span className="text-sm font-bold text-slate-500 uppercase">
                                                        {new Date(ride.departure_time).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <span className="text-2xl font-bold text-slate-900">
                                                        {new Date(ride.departure_time).getDate()}
                                                    </span>
                                                    <span className="text-sm text-slate-500">{formatTime(ride.departure_time)}</span>
                                                </div>

                                                {/* Ride Info */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                                                                    <div className="w-0.5 h-8 bg-slate-200" />
                                                                    <div className="w-2 h-2 rounded-full bg-success" />
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <h3 className="font-semibold text-slate-900">{ride.origin}</h3>
                                                                        {ride.origin_address && (
                                                                            <p className="text-xs text-slate-500">{ride.origin_address}</p>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-semibold text-slate-900">{ride.destination}</h3>
                                                                        {ride.destination_address && (
                                                                            <p className="text-xs text-slate-500">{ride.destination_address}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <div className="text-sm text-slate-500 mb-1">Status</div>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    (isDriverTab ? ride.status : booking.status) === 'upcoming' || (isDriverTab ? ride.status : booking.status) === 'accepted' ? 'bg-green-100 text-green-800' :
                                                                    (isDriverTab ? ride.status : booking.status) === 'completed' ? 'bg-slate-100 text-slate-800' :
                                                                    (isDriverTab ? ride.status : booking.status) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {isDriverTab 
                                                                        ? ride.status.charAt(0).toUpperCase() + ride.status.slice(1)
                                                                        : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm text-slate-500 mb-1">Price</div>
                                                                <div className="font-bold text-slate-900">
                                                                    {formatCurrency(isDriverTab ? ride.price : ride.price * booking.seats)}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm text-slate-500 mb-1">Seats</div>
                                                                <div className="font-bold text-slate-900">
                                                                    {isDriverTab 
                                                                        ? `${ride.seats_available} left`
                                                                        : `${booking.seats} booked`
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex md:flex-col items-center justify-center p-4 border-t md:border-t-0 md:border-l border-slate-100 gap-2">
                                                    {isDriverTab && ride.status === 'upcoming' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="w-full"
                                                            onClick={() => handleCancelRide(ride.id)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                    <Link to={ROUTES.RIDE_DETAILS(ride.id)} className="w-full">
                                                        <Button variant="ghost" size="sm" className="w-full">
                                                            Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MyRides;