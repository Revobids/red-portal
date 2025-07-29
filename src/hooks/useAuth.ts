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
            // Decode JWT payload to get user info (basic implementation)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userData = {
              id: payload.userId || '1',
              username: payload.username || 'user',
              name: payload.username || 'User',
              email: 'user@example.com',
              role: (payload.role?.toUpperCase() || 'MANAGER') as any,
              realEstateDeveloperId: '1',
              officeId: '1',
              employeeId: payload.userId || '1'
            };
            
            dispatch(loginSuccess(userData));
          } catch (error) {
            console.error('Auth initialization failed:', error);
            // Token might be invalid, clear it
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        }
      }
    };

    initAuth();
  }, [dispatch, isAuth]);
};