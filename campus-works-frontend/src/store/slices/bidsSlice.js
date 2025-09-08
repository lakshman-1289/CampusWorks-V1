import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, apiUtils } from '@services/api';

// Async thunks
export const fetchBids = createAsyncThunk(
  'bids/fetchBids',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchBidById = createAsyncThunk(
  'bids/fetchBidById',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.getById(bidId);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const createBid = createAsyncThunk(
  'bids/createBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.create(bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const updateBid = createAsyncThunk(
  'bids/updateBid',
  async ({ id, bidData }, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.update(id, bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const deleteBid = createAsyncThunk(
  'bids/deleteBid',
  async (bidId, { rejectWithValue }) => {
    try {
      await apiService.bids.delete(bidId);
      return bidId;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchBidsByTask = createAsyncThunk(
  'bids/fetchBidsByTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.getByTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchBidsByUser = createAsyncThunk(
  'bids/fetchBidsByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.getByUser(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchBidsByStatus = createAsyncThunk(
  'bids/fetchBidsByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.getByStatus(status);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const triggerAutoSelect = createAsyncThunk(
  'bids/triggerAutoSelect',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await apiService.bids.autoSelect(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

// Initial state
const initialState = {
  bids: [],
  currentBid: null,
  taskBids: [],
  userBids: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  message: null,
  filters: {
    status: null,
    taskId: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 0,
    size: 10,
    total: 0
  }
};

// Bids slice
const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearCurrentBid: (state) => {
      state.currentBid = null;
    },
    clearTaskBids: (state) => {
      state.taskBids = [];
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
    updateBidStatus: (state, action) => {
      const { bidId, status } = action.payload;
      
      // Update in bids array
      const bidIndex = state.bids.findIndex(bid => bid.id === bidId);
      if (bidIndex !== -1) {
        state.bids[bidIndex].status = status;
      }
      
      // Update in taskBids array
      const taskBidIndex = state.taskBids.findIndex(bid => bid.id === bidId);
      if (taskBidIndex !== -1) {
        state.taskBids[taskBidIndex].status = status;
      }
      
      // Update current bid
      if (state.currentBid && state.currentBid.id === bidId) {
        state.currentBid.status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch bids cases
      .addCase(fetchBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      
      // Fetch bid by ID cases
      .addCase(fetchBidById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBidById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBid = action.payload;
      })
      .addCase(fetchBidById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      
      // Create bid cases
      .addCase(createBid.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.isCreating = false;
        state.bids.unshift(action.payload);
        state.taskBids.unshift(action.payload);
        state.message = 'Bid placed successfully';
      })
      .addCase(createBid.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload.message;
      })
      
      // Update bid cases
      .addCase(updateBid.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBid.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.bids.findIndex(bid => bid.id === action.payload.id);
        if (index !== -1) {
          state.bids[index] = action.payload;
        }
        const taskBidIndex = state.taskBids.findIndex(bid => bid.id === action.payload.id);
        if (taskBidIndex !== -1) {
          state.taskBids[taskBidIndex] = action.payload;
        }
        if (state.currentBid && state.currentBid.id === action.payload.id) {
          state.currentBid = action.payload;
        }
        state.message = 'Bid updated successfully';
      })
      .addCase(updateBid.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload.message;
      })
      
      // Delete bid cases
      .addCase(deleteBid.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBid.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.bids = state.bids.filter(bid => bid.id !== action.payload);
        state.taskBids = state.taskBids.filter(bid => bid.id !== action.payload);
        if (state.currentBid && state.currentBid.id === action.payload) {
          state.currentBid = null;
        }
        state.message = 'Bid deleted successfully';
      })
      .addCase(deleteBid.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload.message;
      })
      
      // Fetch bids by task cases
      .addCase(fetchBidsByTask.fulfilled, (state, action) => {
        state.taskBids = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBidsByTask.rejected, (state, action) => {
        state.error = action.payload.message;
      })
      
      // Fetch bids by user cases
      .addCase(fetchBidsByUser.fulfilled, (state, action) => {
        state.userBids = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBidsByUser.rejected, (state, action) => {
        state.error = action.payload.message;
      })
      
      // Trigger auto select cases
      .addCase(triggerAutoSelect.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(triggerAutoSelect.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message || 'Auto-selection triggered successfully';
      })
      .addCase(triggerAutoSelect.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      });
  }
});

export const {
  clearError,
  clearMessage,
  clearCurrentBid,
  clearTaskBids,
  setFilters,
  setPagination,
  resetFilters,
  updateBidStatus
} = bidsSlice.actions;

// Selectors
export const selectBids = (state) => state.bids.bids;
export const selectCurrentBid = (state) => state.bids.currentBid;
export const selectTaskBids = (state) => state.bids.taskBids;
export const selectUserBids = (state) => state.bids.userBids;
export const selectBidsLoading = (state) => state.bids.isLoading;
export const selectBidsCreating = (state) => state.bids.isCreating;
export const selectBidsUpdating = (state) => state.bids.isUpdating;
export const selectBidsDeleting = (state) => state.bids.isDeleting;
export const selectBidsError = (state) => state.bids.error;
export const selectBidsMessage = (state) => state.bids.message;
export const selectBidsFilters = (state) => state.bids.filters;
export const selectBidsPagination = (state) => state.bids.pagination;

// Computed selectors
export const selectWinningBid = (state) => {
  return state.bids.taskBids.find(bid => bid.status === 'ACCEPTED' || bid.isWinning);
};

export const selectLowestBid = (state) => {
  const pendingBids = state.bids.taskBids.filter(bid => bid.status === 'PENDING');
  return pendingBids.reduce((lowest, bid) => {
    return !lowest || bid.amount < lowest.amount ? bid : lowest;
  }, null);
};

export default bidsSlice.reducer;
