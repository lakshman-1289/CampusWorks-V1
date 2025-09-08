import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@constants';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Generic HTTP methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // Authentication methods
  auth: {
    register: (userData) => api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
    login: (credentials) => api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
    logout: () => api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
    validateToken: () => api.get(API_CONFIG.ENDPOINTS.AUTH.VALIDATE),
    getUser: (email) => api.get(`${API_CONFIG.ENDPOINTS.AUTH.USER}/${email}`),
    verifyEmail: (token) => api.get(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY}?token=${token}`),
    resendVerification: (email) => api.post(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION_PUBLIC, { email }),
    getVerificationStatus: (email) => api.get(`${API_CONFIG.ENDPOINTS.AUTH.VERIFICATION_STATUS}/${email}`),
    validateEmailFormat: (email) => api.get(`${API_CONFIG.ENDPOINTS.AUTH.VALIDATE_EMAIL}/${email}`),
    deleteAccount: (email) => api.delete(API_CONFIG.ENDPOINTS.AUTH.DELETE_ACCOUNT, { data: { email } }),
    forgotPassword: (email) => api.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
    resetPassword: (data) => api.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, data),
    changePassword: (data) => api.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
    testAuth: () => api.get(API_CONFIG.ENDPOINTS.AUTH.TEST_AUTH)
  },
  
  // Task methods
  tasks: {
    getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.TASKS.BASE, { params }),
    getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.TASKS.BASE}/${id}`),
    create: (taskData) => api.post(API_CONFIG.ENDPOINTS.TASKS.BASE, taskData),
    update: (id, taskData) => api.put(`${API_CONFIG.ENDPOINTS.TASKS.BASE}/${id}`, taskData),
    delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.TASKS.BASE}/${id}`),
    getByStatus: (status) => api.get(`${API_CONFIG.ENDPOINTS.TASKS.BY_STATUS}/${status}`),
    getByCategory: (category) => api.get(`${API_CONFIG.ENDPOINTS.TASKS.BY_CATEGORY}/${category}`),
    getOpenForBidding: () => api.get(API_CONFIG.ENDPOINTS.TASKS.OPEN_FOR_BIDDING),
    getByUser: (userId) => api.get(`${API_CONFIG.ENDPOINTS.TASKS.BY_USER}/${userId}`),
    getByOwnerEmail: (ownerEmail) => api.get(`${API_CONFIG.ENDPOINTS.TASKS.BY_OWNER_EMAIL}/${ownerEmail}`),
    canEdit: (id) => api.get(`${API_CONFIG.ENDPOINTS.TASKS.BASE}/${id}/can-edit`)
  },
  
  // Bidding methods
  bids: {
    getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.BIDS.BASE, { params }),
    getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BASE}/${id}`),
    create: (bidData) => api.post(API_CONFIG.ENDPOINTS.BIDS.BASE, bidData),
    placeBid: (bidData) => api.post(API_CONFIG.ENDPOINTS.BIDS.BASE, bidData),
    update: (id, bidData) => api.put(`${API_CONFIG.ENDPOINTS.BIDS.BASE}/${id}`, bidData),
    delete: (id) => api.delete(`${API_CONFIG.ENDPOINTS.BIDS.BASE}/${id}`),
    getByTask: (taskId) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_TASK}/${taskId}`),
    getByUser: (userId) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_USER}/${userId}`),
    getByUserEmail: (userEmail) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_USER_EMAIL}/${userEmail}`),
    getByStatus: (status) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_STATUS}/${status}`),
    getWinningBid: (taskId) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BASE}/task/${taskId}/winning`),
    autoSelect: (taskId) => api.post(API_CONFIG.ENDPOINTS.BIDS.AUTO_SELECT.replace('{taskId}', taskId)),
    
    // UPI ID operations
    submitUpiId: (bidId, data) => api.post(`${API_CONFIG.ENDPOINTS.BIDS.BASE}/${bidId}/submit-upi`, data),
    viewUpiId: (bidId) => api.post(`${API_CONFIG.ENDPOINTS.BIDS.BASE}/${bidId}/view-upi`),
    acceptWork: (bidId) => api.post(`${API_CONFIG.ENDPOINTS.BIDS.BASE}/${bidId}/accept-work`),
    getAcceptedBidWithUpi: (taskId) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_TASK}/${taskId}/accepted-with-upi`),
    getAcceptedBid: (taskId) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_TASK}/${taskId}/accepted`),
    hasUpiSubmitted: (taskId) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_TASK}/${taskId}/has-upi-submitted`),
    hasUpiViewed: (taskId) => api.get(`${API_CONFIG.ENDPOINTS.BIDS.BY_TASK}/${taskId}/has-upi-viewed`)
  },
  
  // Profile methods
  profiles: {
    getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.PROFILES.BASE, { params }),
    getById: (id) => api.get(`${API_CONFIG.ENDPOINTS.PROFILES.BASE}/${id}`),
    create: (profileData) => api.post(API_CONFIG.ENDPOINTS.PROFILES.BASE, profileData),
    update: (id, profileData) => api.put(`${API_CONFIG.ENDPOINTS.PROFILES.BASE}/${id}`, profileData),
    getByUser: (userId) => api.get(`${API_CONFIG.ENDPOINTS.PROFILES.BY_USER}/${userId}`),
    getByUserEmail: (userEmail) => api.get(`${API_CONFIG.ENDPOINTS.PROFILES.BY_EMAIL}/${userEmail}`),
    getByAvailability: (status) => api.get(`${API_CONFIG.ENDPOINTS.PROFILES.BY_AVAILABILITY}/${status}`),
    addRating: (userId, ratingData) => api.put(`${API_CONFIG.ENDPOINTS.PROFILES.BY_USER}/${userId}/rating`, ratingData)
  },
  
  // Payment methods
  payments: {
    getAll: (params = {}) => api.get(API_CONFIG.ENDPOINTS.PAYMENTS.BASE, { params }),
    create: (taskId) => api.post(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE.replace('{taskId}', taskId)),
    accept: (taskId, data) => api.post(API_CONFIG.ENDPOINTS.PAYMENTS.ACCEPT.replace('{taskId}', taskId), data),
    reject: (taskId, data) => api.post(API_CONFIG.ENDPOINTS.PAYMENTS.REJECT.replace('{taskId}', taskId), data),
    getWallet: () => api.get(API_CONFIG.ENDPOINTS.PAYMENTS.WALLET),
    getTransactions: (params = {}) => api.get(API_CONFIG.ENDPOINTS.PAYMENTS.TRANSACTIONS, { params })
  }
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  },
  
  // Get stored auth token
  getAuthToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  // Set auth token
  setAuthToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
  
  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },
  
  // Set user data
  setUserData: (userData) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },
  
  // Decode JWT token to get user ID
  getUserIdFromToken: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return null;
      
      // Decode JWT token (simple base64 decode of payload)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.sub; // 'sub' is the subject (user ID)
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  },
  
  // Get user email from token
  getEmailFromToken: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.email;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  },
  
  // Handle API error with specific messages
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      let message = data?.message || 'An error occurred';
      
      // Provide specific error messages based on status and response
      if (status === 401) {
        if (message.includes('Invalid credentials')) {
          // Check if this is a user not found vs wrong password by making a separate call
          // For now, we'll use a more generic message that covers both cases
          message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (message.includes('Account not verified') || message.includes('Email not verified') || message.includes('verify your email')) {
          message = 'Your account is not verified. Please check your email and click the verification link.';
        } else if (message.includes('Account disabled') || message.includes('Account locked')) {
          message = 'Your account has been disabled. Please contact support for assistance.';
        } else {
          message = 'Authentication failed. Please check your credentials and try again.';
        }
      } else if (status === 404) {
        if (message.includes('User not found') || message.includes('Email not registered')) {
          message = 'No account found with this email address. Please check your email or create a new account.';
        } else {
          message = 'The requested resource was not found.';
        }
      } else if (status === 400) {
        if (message.includes('Invalid email format')) {
          message = 'Please enter a valid RGUKT Nuzvidu email address (n######@rguktn.ac.in).';
        } else if (message.includes('Password too weak')) {
          message = 'Password does not meet security requirements. Please use a stronger password.';
        } else if (message.includes('Email already exists')) {
          message = 'An account with this email already exists. Please try signing in instead.';
        } else if (message.includes('already verified') || message.includes('already active')) {
          message = 'Your email is already verified! You can now sign in to your account.';
        } else {
          message = message || 'Invalid request. Please check your input and try again.';
        }
      } else if (status === 429) {
        message = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (status >= 500) {
        message = 'Server error. Please try again later or contact support if the problem persists.';
      }
      
      return {
        message,
        status,
        data
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        status: 0,
        data: null
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred. Please try again.',
        status: 0,
        data: null
      };
    }
  }
};

export default apiService;
