import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginSuccess } from '@/redux/slices/authSlice';
import { isAuthenticated, getCookieValue } from '@/lib/auth';

export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated: isAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = () => {
      if (!isAuth && isAuthenticated()) {
        // For now, we'll just check if token exists
        // In a real app, you'd want to validate the token with the server
        const token = getCookieValue('access_token');
        if (token) {
          try {
            // First try to get user data from localStorage
            const storedUserData = localStorage.getItem('user_data');
            if (storedUserData) {
              const userData = JSON.parse(storedUserData);
              dispatch(loginSuccess(userData));
            } else {
              // Fallback: decode JWT payload to get basic user info
              const payload = JSON.parse(atob(token.split('.')[1]));
              const userData = {
                id: payload.userId || '1',
                username: payload.username || 'user',
                name: payload.username || 'User',
                email: 'user@example.com',
                role: (payload.role?.toUpperCase() || 'MANAGER') as 'ADMIN' | 'MANAGER' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'SALES' | 'FINANCE',
                realEstateDeveloperId: '1',
                officeId: '1',
                employeeId: payload.userId || '1'
              };
              dispatch(loginSuccess(userData));
            }
          } catch (error) {
            console.error('Auth initialization failed:', error);
            // Don't automatically clear the token - let the user stay logged in
            // The token validation should happen on API calls
          }
        }
      }
    };

    initAuth();
  }, [dispatch, isAuth]);
};