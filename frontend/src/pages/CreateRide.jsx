import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, DollarSign, Check, Upload, X } from 'lucide-react';
import { rideService } from '../services/rideService';

const CreateRide = () => {
    const [step, setStep] = useState(1);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [carImage, setCarImage] = useState(null);
    const [carImagePreview, setCarImagePreview] = useState(null);

    // Transform form data to match backend serializer
    const transformFormData = (data) => {
        return {
            origin: data.origin,
            origin_address: data.origin,
            destination: data.destination,
            destination_address: data.destination,
            departure_time: `${data.date}T${data.time}:00`,
            arrival_time: null,
            price: parseFloat(data.price),
            seats_available: parseInt(data.seats),
            total_seats: parseInt(data.seats),
            description: data.description || '',
            instant_booking: data.instantBooking || false,
            preferences: {
                smoking_allowed: data.smoking || false,
                pets_allowed: data.pets || false,
                music_allowed: true,
                chat_allowed: true,
            }
        };
    };

    // Handle car image selection
    const handleCarImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCarImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCarImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove car image
    const removeCarImage = () => {
        setCarImage(null);
        setCarImagePreview(null);
    };

    // Save car information
    const saveCarInfo = async (carData) => {
        try {
            const formData = new FormData();
            formData.append('make', carData.carMake);
            formData.append('model', carData.carModel);
            formData.append('color', carData.carColor);
            formData.append('year', parseInt(carData.carYear));

            if (carImage) {
                formData.append('car_image', carImage);
            }

            await rideService.createOrUpdateCar(formData, true);
        } catch (error) {
            console.error('Error saving car info:', error);
            throw error;
        }
    };

    const onSubmit = async (data) => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            try {
                // Save car information first
                await saveCarInfo(data);

                // Transform and submit ride data
                const rideData = transformFormData(data);
                const result = await rideService.create(rideData);

                alert('Ride published successfully!');
                navigate('/my-rides');
            } catch (error) {
                console.error('Error creating ride:', error);

                if (error.response?.data) {
                    const errors = error.response.data;
                    const errorMessages = Object.entries(errors)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    alert(`Failed to publish ride:\n${errorMessages}`);
                } else {
                    alert('Failed to publish ride. Please try again.');
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const steps = [
        { number: 1, title: "Route & Time" },
        { number: 2, title: "Car & Details" },
        { number: 3, title: "Price & Preferences" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Publish a Ride</h1>
                    <p className="text-gray-600">Share your journey and save on travel costs</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                        {steps.map((s) => (
                            <div key={s.number} className="flex flex-col items-center bg-blue-50 px-4">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-md ${step >= s.number
                                            ? 'bg-blue-600 text-white scale-110'
                                            : 'bg-gray-300 text-gray-600'
                                        }`}
                                >
                                    {step > s.number ? <Check size={24} /> : s.number}
                                </div>
                                <span className={`text-sm font-medium mt-2 ${step >= s.number ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Step 1: Route & Time */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <MapPin className="inline w-4 h-4 mr-1" />
                                            From
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="City, Airport, or Station"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('origin', { required: 'Origin is required' })}
                                        />
                                        {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <MapPin className="inline w-4 h-4 mr-1" />
                                            To
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="City, Airport, or Station"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('destination', { required: 'Destination is required' })}
                                        />
                                        {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="inline w-4 h-4 mr-1" />
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('date', {
                                                required: 'Date is required',
                                                validate: (value) => {
                                                    const selectedDate = new Date(value);
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return selectedDate >= today || 'Date cannot be in the past';
                                                }
                                            })}
                                        />
                                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Clock className="inline w-4 h-4 mr-1" />
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('time', { required: 'Time is required' })}
                                        />
                                        {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Route Description (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                                        placeholder="Add details about your meeting point, route, or breaks..."
                                        {...register('description')}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Car & Details */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Car className="inline w-4 h-4 mr-1" />
                                            Car Make
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Toyota"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('carMake', { required: 'Car make is required' })}
                                        />
                                        {errors.carMake && <p className="text-red-500 text-sm mt-1">{errors.carMake.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Car Model
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Camry"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('carModel', { required: 'Car model is required' })}
                                        />
                                        {errors.carModel && <p className="text-red-500 text-sm mt-1">{errors.carModel.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Color
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Silver"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('carColor', { required: 'Color is required' })}
                                        />
                                        {errors.carColor && <p className="text-red-500 text-sm mt-1">{errors.carColor.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Year
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 2022"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            {...register('carYear', {
                                                required: 'Year is required',
                                                min: { value: 1990, message: 'Year must be 1990 or later' },
                                                max: { value: new Date().getFullYear() + 1, message: 'Invalid year' }
                                            })}
                                        />
                                        {errors.carYear && <p className="text-red-500 text-sm mt-1">{errors.carYear.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Available Seats
                                    </label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map((num) => (
                                            <label key={num} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={num}
                                                    className="peer sr-only"
                                                    {...register('seats', { required: 'Please select number of seats' })}
                                                />
                                                <div className="flex items-center justify-center rounded-xl border-2 border-gray-300 p-4 hover:bg-blue-50 hover:border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-100 transition-all">
                                                    <span className="font-bold text-2xl">{num}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.seats && <p className="text-red-500 text-sm mt-2">{errors.seats.message}</p>}
                                </div>

                                {/* Car Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Upload className="inline w-4 h-4 mr-1" />
                                        Car Image (Optional)
                                    </label>
                                    {!carImagePreview ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCarImageChange}
                                                className="hidden"
                                                id="car-image-upload"
                                            />
                                            <label htmlFor="car-image-upload" className="cursor-pointer">
                                                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                                <p className="text-gray-600 font-medium">Click to upload car image</p>
                                                <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 10MB</p>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={carImagePreview}
                                                alt="Car preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeCarImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Price & Preferences */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <DollarSign className="inline w-4 h-4 mr-1" />
                                        Price per seat
                                    </label>
                                    <div className="relative max-w-xs">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold"
                                            placeholder="0.00"
                                            {...register('price', {
                                                required: 'Price is required',
                                                min: { value: 1, message: 'Price must be at least $1' },
                                                max: { value: 1000, message: 'Price seems too high' }
                                            })}
                                        />
                                    </div>
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                                    <p className="text-sm text-gray-500 mt-2">
                                        💡 Recommended price for this route: $45 - $60
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 text-lg">Preferences</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                                            <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" {...register('smoking')} />
                                            <span className="text-gray-700 font-medium">🚬 Smoking allowed</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                                            <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" {...register('pets')} />
                                            <span className="text-gray-700 font-medium">🐕 Pets allowed</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                                            <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" {...register('instantBooking')} />
                                            <span className="text-gray-700 font-medium">⚡ Instant Booking (No approval needed)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Back
                                </button>
                            ) : (
                                <div></div>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px]"
                            >
                                {isSubmitting ? 'Publishing...' : step === 3 ? 'Publish Ride' : 'Next'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRide;