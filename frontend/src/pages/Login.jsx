import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Facebook, Chrome } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/common/Card';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            addToast('Welcome back! You have successfully logged in.', 'success');
            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            addToast('Failed to login. Please check your credentials.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
                        <p className="text-sm text-slate-600">
                            Enter your credentials to access your account
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email address"
                                type="email"
                                icon={Mail}
                                placeholder="you@example.com"
                                error={errors.email?.message}
                                {...register('email', { required: 'Email is required' })}
                            />
                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    type="password"
                                    icon={Lock}
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    {...register('password', { required: 'Password is required' })}
                                />
                                <div className="flex justify-end">
                                    <Link to="/forgot-password" class="text-xs font-medium text-primary hover:text-primary-hover">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                Sign in
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
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
                            Don't have an account?{' '}
                            <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:text-primary-hover">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default Login;
