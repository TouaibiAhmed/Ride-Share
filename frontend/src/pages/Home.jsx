import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search, MapPin, Calendar, Shield, Clock, CreditCard } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';
import { ROUTES } from '../utils/constants';

const Home = () => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();

    const onSearch = (data) => {
        // Navigate to search page with query params
        const params = new URLSearchParams(data).toString();
        navigate(`${ROUTES.SEARCH}?${params}`);
    };

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-primary py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-700" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />

                <div className="container relative mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center text-white mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Your Ride, Your Way
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8">
                            Connect with drivers and passengers for a comfortable, affordable, and eco-friendly journey.
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6">
                        <form onSubmit={handleSubmit(onSearch)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Leaving from..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border-0 focus:ring-2 focus:ring-primary"
                                    {...register('origin')}
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Going to..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border-0 focus:ring-2 focus:ring-primary"
                                    {...register('destination')}
                                />
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border-0 focus:ring-2 focus:ring-primary text-slate-600"
                                    {...register('date')}
                                />
                            </div>
                            <Button type="submit" size="lg" className="w-full h-full text-lg">
                                Search
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose RideShare?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            We make travel easier, safer, and more affordable for everyone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Safe & Secure",
                                desc: "Verified drivers and passengers with a robust rating system."
                            },
                            {
                                icon: CreditCard,
                                title: "Affordable",
                                desc: "Save money on travel costs by sharing rides with others."
                            },
                            {
                                icon: Clock,
                                title: "Convenient",
                                desc: "Find rides that match your schedule and preferences easily."
                            }
                        ].map((feature, i) => (
                            <Card key={i} className="text-center border-none shadow-none bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                                <CardContent className="pt-8 pb-8">
                                    <div className="w-16 h-16 mx-auto bg-blue-100 text-primary rounded-full flex items-center justify-center mb-6">
                                        <feature.icon size={32} />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">10k+</div>
                            <div className="text-slate-400">Active Users</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-secondary mb-2">50k+</div>
                            <div className="text-slate-400">Rides Completed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-accent mb-2">100+</div>
                            <div className="text-slate-400">Cities Covered</div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Home;
