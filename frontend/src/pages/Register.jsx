import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Chrome, Facebook } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/common/Card';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { register: registerUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const password = watch('password');

   const onSubmit = async (data) => {
         setIsLoading(true);
    try {
        await registerUser({
            email: data.email,
            username: data.username,
            first_name: data.firstName,      // ✅ REQUIRED
            last_name: data.lastName,        // ✅ REQUIRED
            password: data.password,
            password_confirm: data.confirmPassword, // ✅ REQUIRED
            phone_number: data.phoneNumber || "",
            location: data.location || ""
        });

        addToast('Account created successfully!', 'success');
        navigate(ROUTES.LOGIN);
    } catch (error) {
        addToast(
            error.response?.data?.password?.[0] ||
            error.response?.data?.username?.[0] ||
            'Failed to create account',
            'error'
        );
    } finally {
        setIsLoading(false);
    }
    }; 

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl font-bold text-slate-900">Create an account</CardTitle>
                        <p className="text-sm text-slate-600">
                            Join our community of riders and drivers
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    placeholder="Foulen"
                                    error={errors.firstName?.message}
                                    {...register('firstName', { required: 'Required' })}
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="lfouleni"
                                    error={errors.lastName?.message}
                                    {...register('lastName', { required: 'Required' })}
                                />
                            </div>

<Input
    label="Username"
    icon={User}
    placeholder="foulen"
    error={errors.username?.message}
    {...register('username', {
        required: 'Username is required',
        minLength: {
            value: 3,
            message: 'Username must be at least 3 characters'
        },
        maxLength: {
            value: 20,
            message: 'Username must be at most 20 characters'
        },
        pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: 'Username can only contain letters, numbers, and underscores'
        }
    })}
/>



                            <Input
                                label="Email address"
                                type="email"
                                icon={Mail}
                                placeholder="you@example.com"
                                error={errors.email?.message}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />

                            <Input
                                label="Password"
                                type="password"
                                icon={Lock}
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters"
                                    }
                                })}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                icon={Lock}
                                placeholder="••••••••"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword', {
                                    validate: value => value === password || "Passwords do not match"
                                })}
                            />

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    {...register('terms', { required: 'You must agree to the terms' })}
                                />
                                <label htmlFor="terms" className="text-sm text-slate-600">
                                    I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                </label>
                            </div>
                            {errors.terms && <p className="text-xs text-error">{errors.terms.message}</p>}

                            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-slate-500">Or sign up with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full">
                                    <Chrome className="mr-2 h-4 w-4" /> Google
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Facebook className="mr-2 h-4 w-4" /> Facebook
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-slate-100 mt-2">
                        <p className="text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:text-primary-hover">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default Register;
