import { createSlice } from '@reduxjs/toolkit';

// Toast notification slice
const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    notifications: []
  },
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const { addNotification, removeNotification, clearAllNotifications } = toastSlice.actions;

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Helper functions for creating notifications
export const showSuccessToast = (message, duration = 4000) => ({
  type: addNotification.type,
  payload: {
    message,
    type: TOAST_TYPES.SUCCESS,
    duration,
    severity: 'success'
  }
});

export const showErrorToast = (message, duration = 6000) => ({
  type: addNotification.type,
  payload: {
    message,
    type: TOAST_TYPES.ERROR,
    duration,
    severity: 'error'
  }
});

export const showWarningToast = (message, duration = 5000) => ({
  type: addNotification.type,
  payload: {
    message,
    type: TOAST_TYPES.WARNING,
    duration,
    severity: 'warning'
  }
});

export const showInfoToast = (message, duration = 4000) => ({
  type: addNotification.type,
  payload: {
    message,
    type: TOAST_TYPES.INFO,
    duration,
    severity: 'info'
  }
});

// Email-specific toast notifications
export const showEmailSuccessToast = (action) => {
  const messages = {
    'task_assigned': 'Email notifications sent successfully! Task assigned and all parties notified.',
    'upi_submitted': 'Email notification sent to task owner about UPI ID submission.',
    'work_accepted': 'Email notification sent to bidder about work acceptance.',
    'bid_accepted': 'Email notifications sent! Bid accepted and all parties notified.'
  };
  
  return showSuccessToast(messages[action] || 'Email notification sent successfully!');
};

export const showEmailErrorToast = (action) => {
  const messages = {
    'task_assigned': 'Failed to send email notifications. Task was assigned but emails may not have been sent.',
    'upi_submitted': 'Failed to send email notification to task owner.',
    'work_accepted': 'Failed to send email notification to bidder.',
    'bid_accepted': 'Failed to send email notifications. Bid was accepted but emails may not have been sent.'
  };
  
  return showErrorToast(messages[action] || 'Failed to send email notification.');
};

export default toastSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.toast.notifications;
export const selectLatestNotification = (state) => {
  const notifications = state.toast.notifications;
  return notifications.length > 0 ? notifications[notifications.length - 1] : null;
};
