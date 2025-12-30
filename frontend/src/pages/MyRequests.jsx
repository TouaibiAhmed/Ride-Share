import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { Card, CardContent } from '../components/common/Card';
import { ROUTES } from '../utils/constants';
import { MOCK_REQUESTS, getRideWithDriver, CURRENT_USER } from '../utils/mockData';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';

const MyRequests = () => {
    // Filter requests where current user is the passenger
    const requests = MOCK_REQUESTS.filter(req => req.passengerId === CURRENT_USER.id);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { icon: Clock, color: 'text-warning', bg: 'bg-yellow-50', label: 'Pending' };
            case 'accepted':
                return { icon: CheckCircle, color: 'text-success', bg: 'bg-green-50', label: 'Accepted' };
            case 'declined':
                return { icon: XCircle, color: 'text-error', bg: 'bg-red-50', label: 'Declined' };
            default:
                return { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', label: status };
        }
    };

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold text-slate-900 mb-8">My Requests</h1>

                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 mb-4">You haven't made any ride requests yet.</p>
                                <Link to={ROUTES.SEARCH}>
                                    <Button>Find a Ride</Button>
                                </Link>
                            </div>
                        ) : (
                            requests.map((req) => {
                                const ride = getRideWithDriver(req.rideId);
                                const statusConfig = getStatusConfig(req.status);
                                const StatusIcon = statusConfig.icon;

                                if (!ride) return null;

                                return (
                                    <Card key={req.id}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <Avatar src={ride.driver.avatar} size="lg" />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-slate-900">Ride with {ride.driver.name}</span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                                <StatusIcon size={12} className="mr-1" />
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-500">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={14} />
                                                                <span>{ride.origin} → {ride.destination}</span>
                                                            </div>
                                                            <div className="hidden sm:block">•</div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                <span>{formatDate(ride.departureTime)}, {formatTime(ride.departureTime)}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            Requested {req.seats} seat{req.seats > 1 ? 's' : ''} • {formatCurrency(ride.price * req.seats)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 w-full md:w-auto">
                                                    {req.status === 'pending' && (
                                                        <Button variant="outline" className="w-full md:w-auto text-error hover:bg-red-50 hover:text-error border-error/20">
                                                            Cancel Request
                                                        </Button>
                                                    )}
                                                    {req.status === 'accepted' && (
                                                        <>
                                                            <Button variant="outline" className="w-full md:w-auto">Message Driver</Button>
                                                            <Button className="w-full md:w-auto">View Ticket</Button>
                                                        </>
                                                    )}
                                                    {req.status === 'declined' && (
                                                        <Link to={ROUTES.SEARCH} className="w-full md:w-auto">
                                                            <Button variant="outline" className="w-full">Find Another Ride</Button>
                                                        </Link>
                                                    )}
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

export default MyRequests;
