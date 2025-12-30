import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Car, Clock, DollarSign, ChevronRight,
    Bell, PlusCircle, Search
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { formatCurrency, formatTime } from '../utils/helpers';
import { ROUTES } from '../utils/constants';
import { rideService } from '../services/rideService';
import { bookingService } from '../services/bookingService';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';

const Dashboard = () => {
    const [stats, setStats] = useState({
        upcomingRides: [],
        pendingRequests: [],
        earnings: 0,
        unreadNotifications: 0,
        notifications: []
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Get current user profile
            const userData = await userService.getCurrentUser();
            setUser(userData);

            // 2. Get my rides (as driver)
            const myRidesData = await rideService.getMyRides();
            const myRides = myRidesData.results ?? myRidesData;
            const upcomingRides = myRides.filter(r => r.status === 'upcoming');

            // 3. Get pending requests (as driver)
            const driverBookingsData = await bookingService.getAllBookings({ as: 'driver', status: 'pending' });
            const driverBookings = driverBookingsData.results ?? driverBookingsData;

            // 4. Get notifications
            const notificationsData = await notificationService.getNotifications();
            const notifications = notificationsData.results ?? notificationsData;
            const unreadCount = notifications.filter(n => !n.is_read).length;

            setStats({
                upcomingRides,
                pendingRequests: driverBookings,
                earnings: userData.total_earnings || 0, // Assuming this field exists or needs calculation
                unreadNotifications: unreadCount,
                notifications: notifications.slice(0, 5)
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (id) => {
        try {
            await bookingService.accept(id);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to accept request');
        }
    };

    const handleDeclineRequest = async (id) => {
        try {
            await bookingService.decline(id);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to decline request');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                        <div className="flex gap-3">
                            <Link to={ROUTES.SEARCH}>
                                <Button variant="outline">
                                    <Search size={18} className="mr-2" /> Find Ride
                                </Button>
                            </Link>
                            <Link to={ROUTES.CREATE_RIDE}>
                                <Button>
                                    <PlusCircle size={18} className="mr-2" /> Offer Ride
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: "Upcoming Rides", value: stats.upcomingRides.length, icon: Car, color: "text-primary", bg: "bg-blue-50" },
                            { label: "Pending Requests", value: stats.pendingRequests.length, icon: Clock, color: "text-warning", bg: "bg-yellow-50" },
                            { label: "Total Earnings", value: formatCurrency(stats.earnings), icon: DollarSign, color: "text-success", bg: "bg-green-50" },
                            { label: "Notifications", value: stats.unreadNotifications, icon: Bell, color: "text-accent", bg: "bg-orange-50" },
                        ].map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Upcoming Trips</CardTitle>
                                    <Link to={ROUTES.MY_RIDES} className="text-sm text-primary hover:underline">View all</Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {stats.upcomingRides.length === 0 ? (
                                            <p className="text-slate-500 text-sm">No upcoming trips.</p>
                                        ) : (
                                            stats.upcomingRides.slice(0, 3).map((ride) => (
                                                <div key={ride.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-100 text-primary rounded-lg font-bold">
                                                            <span className="text-xs uppercase">{new Date(ride.departure_time).toLocaleString('default', { month: 'short' })}</span>
                                                            <span className="text-lg">{new Date(ride.departure_time).getDate()}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{ride.origin} → {ride.destination}</h4>
                                                            <p className="text-sm text-slate-500">{formatTime(ride.departure_time)} • {ride.seats_available} seats left</p>
                                                        </div>
                                                    </div>
                                                    <Link to={ROUTES.RIDE_DETAILS(ride.id)}>
                                                        <ChevronRight className="text-slate-400" />
                                                    </Link>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Recent Requests</CardTitle>
                                    <Link to={ROUTES.MY_REQUESTS} className="text-sm text-primary hover:underline">View all</Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {stats.pendingRequests.length === 0 ? (
                                            <p className="text-slate-500 text-sm">No pending requests.</p>
                                        ) : (
                                            stats.pendingRequests.slice(0, 3).map((req) => (
                                                <div key={req.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                <span className="font-bold">{req.passenger?.full_name || 'A user'}</span> requested {req.seats} seat{req.seats > 1 ? 's' : ''}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{req.ride?.origin} → {req.ride?.destination}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleDeclineRequest(req.id)}>Decline</Button>
                                                        <Button size="sm" className="h-8 text-xs" onClick={() => handleAcceptRequest(req.id)}>Accept</Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions & Notifications */}
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-br from-primary to-blue-600 text-white border-none">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold mb-2">Invite Friends</h3>
                                    <p className="text-blue-100 text-sm mb-4">
                                        Earn $10 for every friend you invite to join RideShare.
                                    </p>
                                    <Button variant="secondary" className="w-full bg-white text-primary hover:bg-blue-50">
                                        Copy Invite Link
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Notifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {stats.notifications.length === 0 ? (
                                            <p className="text-slate-500 text-sm">No new notifications.</p>
                                        ) : (
                                            stats.notifications.map((notif) => (
                                                <div key={notif.id} className="flex gap-3 text-sm">
                                                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.is_read ? 'bg-slate-200' : 'bg-primary'}`} />
                                                    <p className="text-slate-600">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
