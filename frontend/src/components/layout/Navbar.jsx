import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Car, Search, PlusCircle, User, Bell, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import NotificationBell from '../common/NotificationBell';
import { APP_NAME, ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const userMenuRef = useRef(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
        setIsUserMenuOpen(false);
    };

    const navLinks = [
        { name: 'Search', path: ROUTES.SEARCH, icon: Search },
        { name: 'Publish a Ride', path: ROUTES.CREATE_RIDE, icon: PlusCircle },
    ];

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to={ROUTES.HOME} className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
                        <Car className="h-8 w-8" />
                        <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-slate-600'
                                    }`}
                            >
                                <link.icon size={18} />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <NotificationBell />

                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 focus:outline-none"
                                    >
                                        <Avatar src={user.avatar} size="sm" className="cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-2 border-b border-slate-100">
                                                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to={ROUTES.DASHBOARD}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <LayoutDashboard size={16} />
                                                Dashboard
                                            </Link>
                                            <Link
                                                to={ROUTES.PROFILE}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <User size={16} />
                                                Profile
                                            </Link>
                                            <Link
                                                to={ROUTES.MY_RIDES}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Car size={16} />
                                                My Rides
                                            </Link>
                                            <Link
                                                to={ROUTES.RIDE_REQUESTS}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Bell size={16} />
                                                Ride Requests
                                            </Link>
                                            <div className="border-t border-slate-100 mt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50"
                                                >
                                                    <LogOut size={16} />
                                                    Log out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to={ROUTES.LOGIN}>
                                    <Button variant="ghost">Log in</Button>
                                </Link>
                                <Link to={ROUTES.REGISTER}>
                                    <Button>Sign up</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white p-4 shadow-lg animate-in slide-in-from-top-5">
                    <div className="flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <link.icon size={20} />
                                {link.name}
                            </Link>
                        ))}
                        <hr className="border-slate-100" />
                        {user ? (
                            <>
                                <div className="px-4 py-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={user.avatar} size="sm" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={ROUTES.DASHBOARD}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard size={20} />
                                    Dashboard
                                </Link>
                                <Link
                                    to={ROUTES.PROFILE}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User size={20} />
                                    Profile
                                </Link>
                                <Link
                                    to={ROUTES.MY_RIDES}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Car size={20} />
                                    My Rides
                                </Link>
                                <Link
                                    to={ROUTES.RIDE_REQUESTS}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Bell size={20} />
                                    Ride Requests
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-error font-medium"
                                >
                                    <LogOut size={20} />
                                    Log out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 pt-2">
                                <Link to={ROUTES.LOGIN} onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Log in</Button>
                                </Link>
                                <Link to={ROUTES.REGISTER} onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full">Sign up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
