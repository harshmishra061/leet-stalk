import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, clear tokens but don't redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          return Promise.reject(error);
        }

        // Try to refresh the token using a separate axios instance to avoid infinite loop
        const refreshResponse = await axios.create().post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { token, refreshToken: newRefreshToken } = refreshResponse.data;
        
        // Update stored tokens
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the authorization header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens but don't redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast errors for search endpoints
    const isSearchEndpoint = error.config?.url?.includes('/search-leetcode');
    
    if (!isSearchEndpoint && error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else if (!isSearchEndpoint && error.message) {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Users API
export const usersAPI = {
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, data) => api.put(`/users/${userId}`, data),
  updateProfile: (data) => api.put('/auth/profile', data),
  getProgressBoard: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/users/leaderboard${queryParams ? `?${queryParams}` : ''}`);
  },
};

// LeetCode API
export const leetcodeAPI = {
  getProfile: (username) => api.get(`/leetcode/profile${username ? `/${username}` : ''}`),
  fetchProfile: (username) => api.post(`/leetcode/fetch/${username}`),
  compareProfiles: (username1, username2) => api.get(`/leetcode/compare/${username1}/${username2}`),
  deleteProfile: () => api.delete('/leetcode/profile'),
  getGlobalStats: () => api.get('/leetcode/stats/global'),
};

// Friends API
export const friendsAPI = {
  followLeetCodeUser: (username) => api.post('/friends/follow', { leetcodeUsername: username }),
  unfollowLeetCodeUser: (username) => api.delete(`/friends/unfollow/${username}`),
  getFollowing: () => api.get('/friends/following'),
  searchLeetCodeUser: (query) => api.get(`/friends/search?q=${encodeURIComponent(query)}`),
};



export default api; 