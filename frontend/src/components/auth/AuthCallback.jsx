import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    console.log('🔍 AuthCallback useEffect triggered');
    // Prevent multiple executions
    if (hasProcessed.current) {
      console.log('🔍 Already processed, skipping...');
      return;
    }
    
    const handleOAuthCallback = async () => {
      console.log('🔍 Starting OAuth callback processing...');
      hasProcessed.current = true;
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token && refreshToken) {
        // Store tokens
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // For OAuth login, we don't need to call the login API
        // The tokens are already stored and we can fetch user data
        try {
          console.log('🔍 Fetching user data with token:', token.substring(0, 20) + '...');
          // Fetch current user data to update the context
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('🔍 Response status:', response.status);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('🔍 User data received:', userData);
            // Update auth context with user data
            localStorage.setItem('user', JSON.stringify(userData.user));
            console.log('🔍 User data stored in localStorage');
            // Update auth context
            oauthLogin(userData.user);
            toast.success('Successfully logged in with Google!');
            console.log('🔍 Redirecting to dashboard...');
            navigate('/dashboard');
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
        }
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, oauthLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 