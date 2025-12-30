import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { Star, Shield, Calendar, MapPin, Settings } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Modal from '../components/common/Modal';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    location: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to get user display name
  const getUserDisplayName = (userData) => {
    if (!userData) return 'Unknown User';
    if (userData.name) return userData.name;
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`.trim();
    }
    if (userData.first_name) return userData.first_name;
    if (userData.username) return userData.username;
    if (userData.email) return userData.email.split('@')[0];
    return 'User';
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let profile;
        if (id && id !== 'edit') {
          profile = await userService.getUserById(id);
        } else if (!id) {
          profile = await userService.getCurrentUser();
        } else {
          if (mounted) {
            setError("Invalid profile URL");
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;
        setUser(profile);

        // Initialize edit form data
        setEditFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          location: profile.location || profile.city || '',
        });

        try {
          const statsData = await userService.getUserStats(profile.id);
          if (mounted) {
            setStats(statsData);
          }
        } catch (statsErr) {
          console.warn("Could not load stats:", statsErr);
          if (mounted) {
            setStats({ ridesGiven: 0, ridesTaken: 0, distance: 0 });
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
        if (mounted) {
          if (err.response?.status === 401) {
            setError("Please log in to view this profile");
          } else if (err.response?.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load profile");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, [id]);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await userService.updateCurrentUser(editFormData);
      await refreshUser();
      
      // Update local user state
      const updatedProfile = await userService.getCurrentUser();
      setUser(updatedProfile);
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-slate-600 text-lg">User not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = getUserDisplayName(user);

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="text-center p-6">
                <div className="flex flex-col items-center">
                  <Avatar 
                    size="xl" 
                    src={user.avatar || user.profile_picture} 
                    className="mb-4 h-32 w-32" 
                  />
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  {(user.isVerified || user.is_verified) && (
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      <Shield size={14} className="text-success fill-success/20" />
                      <span>Verified Member</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-3 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-slate-900">
                      {user.rating || user.average_rating || 'N/A'}
                    </span>
                    <span className="text-slate-500 text-sm">
                      ({user.reviewsCount || user.reviews_count || 0} reviews)
                    </span>
                  </div>

                  <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Calendar size={18} />
                      <span className="text-sm">
                        Joined {user.joinedDate || user.joined_date || user.date_joined || 'Recently'}
                      </span>
                    </div>
                    {(user.location || user.city) && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <MapPin size={18} />
                        <span className="text-sm">{user.location || user.city}</span>
                      </div>
                    )}
                  </div>

                  {currentUser && user.id === currentUser.id && (
                    <Button 
                      onClick={handleEditClick} 
                      className="mt-6 w-full"
                    >
                      <Settings size={16} className="mr-2" /> Edit Profile
                    </Button>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Verifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Email Address</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      user.emailVerified || user.email_verified || user.is_email_verified
                        ? 'text-success bg-success/10'
                        : 'text-slate-400 bg-slate-100'
                    }`}>
                      {user.emailVerified || user.email_verified || user.is_email_verified 
                        ? 'Verified' 
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Phone Number</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      user.phoneVerified || user.phone_verified || user.is_phone_verified
                        ? 'text-success bg-success/10'
                        : 'text-slate-400 bg-slate-100'
                    }`}>
                      {user.phoneVerified || user.phone_verified || user.is_phone_verified 
                        ? 'Verified' 
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">ID Card</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      user.idVerified || user.id_verified || user.is_id_verified
                        ? 'text-success bg-success/10'
                        : 'text-slate-400 bg-slate-100'
                    }`}>
                      {user.idVerified || user.id_verified || user.is_id_verified 
                        ? 'Verified' 
                        : 'Pending'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {displayName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    {user.bio || user.description || 'No bio available yet.'}
                  </p>

                  {stats && (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {stats.ridesGiven || stats.rides_given || 0}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                          Rides Given
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-secondary">
                          {stats.ridesTaken || stats.rides_taken || 0}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                          Rides Taken
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-accent">
                          {stats.distance || stats.total_distance || 0}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                          Distance Shared
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.reviews && user.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {user.reviews.slice(0, 3).map((review, i) => (
                        <div key={review.id || i} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar 
                                size="sm" 
                                src={review.avatar || review.reviewer_avatar || `https://i.pravatar.cc/150?u=${i + 10}`} 
                              />
                              <div>
                                <div className="font-medium text-slate-900">
                                  {review.reviewerName || review.reviewer_name || 
                                   review.reviewer?.name || 'Anonymous'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {review.date || review.created_at || 'Recent'} • {review.type || 'Passenger'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center bg-slate-100 px-2 py-1 rounded">
                              <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-xs font-bold">{review.rating || 5.0}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">
                            {review.comment || review.text || 'Great experience!'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No reviews yet</p>
                  )}
                  {user.reviews && user.reviews.length > 3 && (
                    <div className="mt-6 text-center">
                      <Button variant="ghost" size="sm">Show all reviews</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={editFormData.first_name}
                onChange={handleEditFormChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={editFormData.last_name}
                onChange={handleEditFormChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={editFormData.bio}
              onChange={handleEditFormChange}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditFormChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={editFormData.location}
              onChange={handleEditFormChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Profile;