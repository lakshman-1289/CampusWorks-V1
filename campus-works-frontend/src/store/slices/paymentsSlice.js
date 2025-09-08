import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, apiUtils } from '@services/api';

// Async thunks
export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await apiService.payments.create(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const acceptWork = createAsyncThunk(
  'payments/acceptWork',
  async ({ taskId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiService.payments.accept(taskId, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const rejectWork = createAsyncThunk(
  'payments/rejectWork',
  async ({ taskId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiService.payments.reject(taskId, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchWallet = createAsyncThunk(
  'payments/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.payments.getWallet();
      return response.data.wallet;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'payments/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.payments.getTransactions(params);
      return response.data.transactions;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

// Initial state
const initialState = {
  wallet: {
    id: null,
    userId: null,
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalRefunded: 0,
    status: 'ACTIVE',
    lastTransactionAt: null
  },
  transactions: [],
  currentPayment: null,
  isLoading: false,
  isCreatingPayment: false,
  isProcessingWork: false,
  error: null,
  message: null,
  pagination: {
    page: 0,
    size: 10,
    total: 0
  }
};

// Payments slice
const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateWalletBalance: (state, action) => {
      const { amount, type } = action.payload;
      
      switch (type) {
        case 'PAYMENT_RELEASED':
          state.wallet.balance += amount;
          state.wallet.totalEarned += amount;
          break;
        case 'PAYMENT_REFUNDED':
          state.wallet.balance += amount;
          state.wallet.totalRefunded += amount;
          break;
        case 'ESCROW_FUNDED':
          state.wallet.totalSpent += amount;
          break;
        default:
          break;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create payment cases
      .addCase(createPayment.pending, (state) => {
        state.isCreatingPayment = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isCreatingPayment = false;
        state.currentPayment = action.payload.payment;
        state.message = action.payload.message || 'Payment created successfully';
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isCreatingPayment = false;
        state.error = action.payload.message;
      })
      
      // Accept work cases
      .addCase(acceptWork.pending, (state) => {
        state.isProcessingWork = true;
        state.error = null;
        state.message = null;
      })
      .addCase(acceptWork.fulfilled, (state, action) => {
        state.isProcessingWork = false;
        state.message = action.payload.message || 'Work accepted and payment released';
        
        // Update wallet if transaction info is provided
        if (action.payload.transaction) {
          const { amount, type } = action.payload.transaction;
          paymentsSlice.caseReducers.updateWalletBalance(state, {
            payload: { amount, type }
          });
        }
      })
      .addCase(acceptWork.rejected, (state, action) => {
        state.isProcessingWork = false;
        state.error = action.payload.message;
      })
      
      // Reject work cases
      .addCase(rejectWork.pending, (state) => {
        state.isProcessingWork = true;
        state.error = null;
        state.message = null;
      })
      .addCase(rejectWork.fulfilled, (state, action) => {
        state.isProcessingWork = false;
        state.message = action.payload.message || 'Work rejected and payment refunded';
        
        // Update wallet if transaction info is provided
        if (action.payload.transaction) {
          const { amount, type } = action.payload.transaction;
          paymentsSlice.caseReducers.updateWalletBalance(state, {
            payload: { amount, type }
          });
        }
      })
      .addCase(rejectWork.rejected, (state, action) => {
        state.isProcessingWork = false;
        state.error = action.payload.message;
      })
      
      // Fetch wallet cases
      .addCase(fetchWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      
      // Fetch transactions cases
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      });
  }
});

export const {
  clearError,
  clearMessage,
  clearCurrentPayment,
  setPagination,
  updateWalletBalance
} = paymentsSlice.actions;

// Selectors
export const selectWallet = (state) => state.payments.wallet;
export const selectTransactions = (state) => state.payments.transactions;
export const selectCurrentPayment = (state) => state.payments.currentPayment;
export const selectPaymentsLoading = (state) => state.payments.isLoading;
export const selectPaymentsCreating = (state) => state.payments.isCreatingPayment;
export const selectPaymentsProcessing = (state) => state.payments.isProcessingWork;
export const selectPaymentsError = (state) => state.payments.error;
export const selectPaymentsMessage = (state) => state.payments.message;
export const selectPaymentsPagination = (state) => state.payments.pagination;

// Computed selectors
export const selectWalletBalance = (state) => state.payments.wallet.balance;
export const selectTotalEarnings = (state) => state.payments.wallet.totalEarned;
export const selectTotalSpent = (state) => state.payments.wallet.totalSpent;

export default paymentsSlice.reducer;
