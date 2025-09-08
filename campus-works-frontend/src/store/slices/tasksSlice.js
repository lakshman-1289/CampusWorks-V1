import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, apiUtils } from '@services/api';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.getById(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.create(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.update(id, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await apiService.tasks.delete(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchTasksByStatus = createAsyncThunk(
  'tasks/fetchTasksByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.getByStatus(status);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchTasksByCategory = createAsyncThunk(
  'tasks/fetchTasksByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.getByCategory(category);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchOpenTasks = createAsyncThunk(
  'tasks/fetchOpenTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.getOpenForBidding();
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

export const fetchUserTasks = createAsyncThunk(
  'tasks/fetchUserTasks',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiService.tasks.getByUser(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiUtils.handleError(error));
    }
  }
);

// Initial state
const initialState = {
  tasks: [],
  currentTask: null,
  openTasks: [],
  userTasks: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  message: null,
  filters: {
    status: null,
    category: null,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 0,
    size: 10,
    total: 0
  }
};

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks cases
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      
      // Fetch task by ID cases
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      
      // Create task cases
      .addCase(createTask.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isCreating = false;
        state.tasks.unshift(action.payload);
        state.message = 'Task created successfully';
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload.message;
      })
      
      // Update task cases
      .addCase(updateTask.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        state.message = 'Task updated successfully';
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload.message;
      })
      
      // Delete task cases
      .addCase(deleteTask.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        if (state.currentTask && state.currentTask.id === action.payload) {
          state.currentTask = null;
        }
        state.message = 'Task deleted successfully';
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload.message;
      })
      
      // Fetch open tasks cases
      .addCase(fetchOpenTasks.fulfilled, (state, action) => {
        state.openTasks = Array.isArray(action.payload) ? action.payload : [];
      })
      
      // Fetch user tasks cases
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.userTasks = Array.isArray(action.payload) ? action.payload : [];
      });
  }
});

export const {
  clearError,
  clearMessage,
  clearCurrentTask,
  setFilters,
  setPagination,
  resetFilters
} = tasksSlice.actions;

// Selectors
export const selectTasks = (state) => state.tasks.tasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectOpenTasks = (state) => state.tasks.openTasks;
export const selectUserTasks = (state) => state.tasks.userTasks;
export const selectTasksLoading = (state) => state.tasks.isLoading;
export const selectTasksCreating = (state) => state.tasks.isCreating;
export const selectTasksUpdating = (state) => state.tasks.isUpdating;
export const selectTasksDeleting = (state) => state.tasks.isDeleting;
export const selectTasksError = (state) => state.tasks.error;
export const selectTasksMessage = (state) => state.tasks.message;
export const selectTasksFilters = (state) => state.tasks.filters;
export const selectTasksPagination = (state) => state.tasks.pagination;

export default tasksSlice.reducer;
