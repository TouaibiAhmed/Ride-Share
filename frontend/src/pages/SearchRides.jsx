import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, MapPin, Calendar } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import RideCard from '../components/rides/RideCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { rideService } from '../services/rideService';

const SearchRides = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Local state for inputs to allow editing
    const [origin, setOrigin] = useState(searchParams.get('origin') || '');
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [date, setDate] = useState(searchParams.get('departure_date') || '');

    // Additional filters
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [minSeats, setMinSeats] = useState(searchParams.get('min_seats') || '');
    const [instantBooking, setInstantBooking] = useState(searchParams.get('instant_booking') === 'true');

    // Update state when URL params change
    useEffect(() => {
        setOrigin(searchParams.get('origin') || '');
        setDestination(searchParams.get('destination') || '');
        setDate(searchParams.get('departure_date') || '');
        setMinPrice(searchParams.get('min_price') || '');
        setMaxPrice(searchParams.get('max_price') || '');
        setMinSeats(searchParams.get('min_seats') || '');
        setInstantBooking(searchParams.get('instant_booking') === 'true');
    }, [searchParams]);

    const handleSearch = () => {
        const params = {};
        if (origin) params.origin = origin;
        if (destination) params.destination = destination;
        if (date) params.departure_date = date;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (minSeats) params.min_seats = minSeats;
        if (instantBooking) params.instant_booking = 'true';

        setSearchParams(params);
    };

    // Rides fetched from backend
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchRides = async () => {
            setLoading(true);
            setError(null);
            try {
                const filters = {};
                for (let [key, value] of searchParams.entries()) {
                    filters[key] = value;
                }

                const data = await rideService.search(filters);
                // Support paginated responses (DRF) and plain lists
                const items = data.results ?? data;

                if (!mounted) return;

                // Ensure driver/car defaults to avoid runtime errors in `RideCard`
                const normalized = (items || []).map((r) => ({
                    ...r,
                    driver: r.driver || r.user || { name: 'Driver', avatar: null, rating: 0, reviewsCount: 0 },
                    car: r.car || null,
                }));

                setRides(normalized);
            } catch (err) {
                console.error('Error fetching rides', err);
                if (mounted) setError('Failed to load rides');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchRides();

        return () => { mounted = false; };
    }, [searchParams]);

    return (
        <Layout>
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Leaving from..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Going to..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button className="w-full md:w-auto px-8" onClick={handleSearch}>Search</Button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Filter Sidebar - Hidden on mobile unless toggled */}
                        <div className={`lg:block ${isFilterOpen ? 'block' : 'hidden'} w-full lg:w-1/4`}>
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        Filters
                                        <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsFilterOpen(false)}>
                                            Close
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Sort By */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
                                        <select className="w-full rounded-md border-slate-300 text-sm focus:ring-primary">
                                            <option>Earliest departure</option>
                                            <option>Lowest price</option>
                                            <option>Shortest duration</option>
                                        </select>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Price Range</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Min"
                                                type="number"
                                                className="h-9 text-sm"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                            />
                                            <span className="text-slate-400">-</span>
                                            <Input
                                                placeholder="Max"
                                                type="number"
                                                className="h-9 text-sm"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Seats available */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Min Seats Available</label>
                                        <Input
                                            placeholder="Example: 2"
                                            type="number"
                                            className="h-9 text-sm"
                                            value={minSeats}
                                            onChange={(e) => setMinSeats(e.target.value)}
                                        />
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Departure Time</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                                                <span className="text-sm text-slate-600">Before 6:00 AM</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                                                <span className="text-sm text-slate-600">6:00 AM - 12:00 PM</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                                                <span className="text-sm text-slate-600">12:00 PM - 6:00 PM</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                                                <span className="text-sm text-slate-600">After 6:00 PM</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-primary focus:ring-primary"
                                                    checked={instantBooking}
                                                    onChange={(e) => setInstantBooking(e.target.checked)}
                                                />
                                                <span className="text-sm text-slate-600">Instant booking only</span>
                                            </label>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4" onClick={handleSearch}>Apply Filters</Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Results */}
                        <div className="w-full lg:w-3/4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {loading ? 'Loading rides...' : `${rides.length} ${rides.length === 1 ? 'ride' : 'rides'} available`}
                                </h2>
                                <Button variant="outline" className="lg:hidden" onClick={() => setIsFilterOpen(true)}>
                                    <Filter size={18} className="mr-2" /> Filters
                                </Button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                                    <p className="text-slate-500 text-lg">Loading rides...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                                    <p className="text-red-500 text-lg">{error}</p>
                                    <Button variant="ghost" className="mt-4" onClick={() => setSearchParams(Object.fromEntries(searchParams))}>Retry</Button>
                                </div>
                            ) : rides.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                                    <p className="text-slate-500 text-lg">No rides found matching your criteria.</p>
                                    <Button variant="ghost" className="mt-4" onClick={() => {
                                        setOrigin('');
                                        setDestination('');
                                        setDate('');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setMinSeats('');
                                        setInstantBooking(false);
                                        setSearchParams({});
                                    }}>Clear Filters</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {rides.map((ride) => (
                                        <RideCard key={ride.id} ride={ride} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SearchRides;
