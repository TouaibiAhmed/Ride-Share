import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Github, Twitter, Instagram } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                            <Car className="h-6 w-6" />
                            <span className="text-lg font-bold">{APP_NAME}</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Connecting people for a better journey. Safe, reliable, and affordable rides for everyone.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/search" className="hover:text-white transition-colors">Search Rides</Link></li>
                            <li><Link to="/create-ride" className="hover:text-white transition-colors">Post a Ride</Link></li>
                            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link to="/safety" className="hover:text-white transition-colors">Safety</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Follow Us</h4>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
