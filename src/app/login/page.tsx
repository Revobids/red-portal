'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Building2, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginStart, loginSuccess, loginFailure, clearError } from '@/redux/slices/authSlice';
import ApiManager from '@/api/ApiManager';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Clear error when user starts typing
  const handleInputChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());
    
    try {
      const response = await ApiManager.login(data);
      console.log('Login response:', response);
      
      // Check if response has accessToken and employee (actual API response structure)
      if ((response as any).accessToken && (response as any).employee) {
        // Store token in cookie
        document.cookie = `access_token=${(response as any).accessToken}; path=/; max-age=86400`;
        
        // Use the employee data directly from the response
        const userData = (response as any).employee;
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        dispatch(loginSuccess(userData));
        router.push('/dashboard');
      } else if (response.success && response.data) {
        // Fallback to expected structure
        document.cookie = `access_token=${response.data.token}; path=/; max-age=86400`;
        const userData = response.data.user;
        dispatch(loginSuccess(userData));
        router.push('/dashboard');
      } else {
        dispatch(loginFailure(response.message || 'Login failed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-600 mt-2">Sign in to your Real Estate Portal</p>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    {...register('username')}
                    onChange={(e) => {
                      register('username').onChange(e);
                      handleInputChange();
                    }}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    {...register('password')}
                    onChange={(e) => {
                      register('password').onChange(e);
                      handleInputChange();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Secure real estate management platform
          </p>
        </div>
      </div>
    </div>
  );
}