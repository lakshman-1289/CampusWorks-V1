import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, apiUtils } from '@services/api';
import { STORAGE_KEYS } from '@constants';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.login(credentials);
      const { token, email, message } = response.data;
      
      // Store token and user data
      apiUtils.setAuthToken(token);
      apiUtils.setUserData({ email });
      
      return { token, email, message };
    } catch (error) {
      // Enhanced error handling for login
      const errorInfo = apiUtils.handleError(error);
      
      // If it's an "Invalid credentials" error, check if user exists
      if (errorInfo.message.includes('Invalid credentials')) {
        try {
          const verificationResponse = await apiService.auth.getVerificationStatus(credentials.email);
          const userExists = verificationResponse.data.userExists;
          
          if (!userExists) {
            errorInfo.message = 'No account found with this email address. Please check your email or create a new account.';
          } else {
            errorInfo.message = 'Invalid password. Please check your password and try again.';
          }
        } catch (verificationError) {
          // If we can't check verification status, keep the original error
          console.warn('Could not check user existence:', verificationError);
        }
      }
      
      return rejectWithValue(errorInfo);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const getUserInfo = createAsyncThunk(
  'auth/getUserInfo',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.getUser(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.logout();
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.validateToken();
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const checkVerificationStatus = createAsyncThunk(
  'auth/checkVerificationStatus',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiService.auth.getVerificationStatus(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

// Initial state
const initialState = {
  user: apiUtils.getUserData(),
  token: apiUtils.getAuthToken(),
  isAuthenticated: apiUtils.isAuthenticated(),
  isLoading: false,
  error: null,
  message: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
      apiUtils.clearAuthData();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      apiUtils.setUserData(state.user);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Get user ID from token
        const userId = apiUtils.getUserIdFromToken();
        state.user = { 
          email: action.payload.email,
          id: userId
        };
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        state.isAuthenticated = false;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      
      // Get user info cases
      .addCase(getUserInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
        apiUtils.setUserData(state.user);
      })
      .addCase(getUserInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.message = action.payload.message || 'Logout successful';
        apiUtils.clearAuthData();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
        // Even if logout fails on server, clear local data for security
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        apiUtils.clearAuthData();
      })
      
      // Validate token cases
      .addCase(validateToken.fulfilled, (state, action) => {
        if (!action.payload.valid) {
          // Token is invalid, clear auth data
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          apiUtils.clearAuthData();
        }
      })
      .addCase(validateToken.rejected, (state) => {
        // Token validation failed, clear auth data
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        apiUtils.clearAuthData();
      })
      
      // Check verification status cases
      .addCase(checkVerificationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkVerificationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        // Verification status is returned, can be used for UI feedback
      })
      .addCase(checkVerificationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      });
  }
});

export const { clearError, clearMessage, logout, updateUser } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;

export default authSlice.reducer;
