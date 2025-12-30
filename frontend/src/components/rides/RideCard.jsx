import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, User, Car } from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { formatCurrency, formatTime, formatDate } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';

const RideCard = ({ ride }) => {
    return (
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Left: Ride Info */}
                <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg font-bold text-slate-900">{formatTime(ride.departureTime)}</span>
                                <div className="h-8 w-0.5 bg-slate-200 my-1 relative">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-slate-300 bg-white" />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-slate-300 bg-slate-300" />
                                </div>
                                <span className="text-lg font-bold text-slate-500">{formatTime(ride.arrivalTime)}</span>
                            </div>
                            <div className="flex flex-col justify-between h-full py-1">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{ride.origin}</h3>
                                    <p className="text-xs text-slate-500">{ride.originAddress}</p>
                                </div>
                                <div className="mt-6">
                                    <h3 className="font-semibold text-slate-900">{ride.destination}</h3>
                                    <p className="text-xs text-slate-500">{ride.destinationAddress}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{formatCurrency(ride.price)}</div>
                            <div className="text-sm text-slate-500">per seat</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <Avatar src={ride.driver.avatar} alt={ride.driver.name} size="sm" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">{ride.driver.name}</div>
                                <div className="flex items-center text-xs text-slate-500">
                                    <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                                    <span>{ride.driver.rating}</span>
                                    <span className="mx-1">•</span>
                                    <span>{ride.driver.reviewsCount} reviews</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            {ride.car && (
                                <div className="flex items-center gap-1" title={`${ride.car.make} ${ride.car.model}`}>
                                    <Car size={16} />
                                    <span className="hidden sm:inline">{ride.car.make}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1" title={`${ride.seatsAvailable} seats left`}>
                                <User size={16} />
                                <span>{ride.seatsAvailable} left</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Action (Desktop) */}
                <div className="hidden md:flex flex-col justify-center items-center p-6 bg-slate-50 border-l border-slate-100 w-48">
                    <Link to={ROUTES.RIDE_DETAILS(ride.id)} className="w-full">
                        <Button className="w-full">View Details</Button>
                    </Link>
                </div>

                {/* Mobile Action */}
                <div className="md:hidden p-4 bg-slate-50 border-t border-slate-100">
                    <Link to={ROUTES.RIDE_DETAILS(ride.id)} className="w-full">
                        <Button className="w-full">View Details</Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default RideCard;
