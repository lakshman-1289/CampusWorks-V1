/**
 * Deadline validation utilities for CampusWorks
 * Handles task deadline validation and auto-cancellation logic
 */

/**
 * Check if a deadline has expired
 * @param {string|Date} deadline - The deadline to check
 * @returns {boolean} - True if deadline has expired
 */
export const isDeadlineExpired = (deadline) => {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return now > deadlineDate;
};

/**
 * Get time remaining until deadline
 * @param {string|Date} deadline - The deadline to check
 * @returns {Object} - Object with time remaining details
 */
export const getTimeRemaining = (deadline) => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate - now;
  
  if (diff <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      total: 0
    };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    expired: false,
    days,
    hours,
    minutes,
    total: diff
  };
};

/**
 * Format time remaining as a human-readable string
 * @param {string|Date} deadline - The deadline to format
 * @returns {string} - Formatted time remaining string
 */
export const formatTimeRemaining = (deadline) => {
  const timeRemaining = getTimeRemaining(deadline);
  
  if (!timeRemaining) return 'No deadline set';
  if (timeRemaining.expired) return 'Deadline expired';
  
  const { days, hours, minutes } = timeRemaining;
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
};

/**
 * Get deadline status color for UI components
 * @param {string|Date} deadline - The deadline to check
 * @returns {string} - Color name for UI components
 */
export const getDeadlineStatusColor = (deadline) => {
  if (!deadline) return 'default';
  
  const timeRemaining = getTimeRemaining(deadline);
  
  if (timeRemaining.expired) return 'error';
  
  const { days, hours } = timeRemaining;
  
  // Less than 1 hour remaining - critical
  if (days === 0 && hours === 0) return 'error';
  
  // Less than 1 day remaining - warning
  if (days === 0) return 'warning';
  
  // More than 1 day remaining - success
  return 'success';
};

/**
 * Check if a task should be auto-cancelled due to expired deadline
 * @param {Object} task - The task object
 * @returns {boolean} - True if task should be auto-cancelled
 */
export const shouldAutoCancelTask = (task) => {
  if (!task) return false;
  
  // Only auto-cancel if task is in progress or assigned
  if (!['IN_PROGRESS', 'ASSIGNED'].includes(task.status)) return false;
  
  // Check if completion deadline has expired
  return isDeadlineExpired(task.completionDeadline);
};

/**
 * Get deadline warning message for UI
 * @param {string|Date} deadline - The deadline to check
 * @returns {string|null} - Warning message or null if no warning needed
 */
export const getDeadlineWarning = (deadline) => {
  if (!deadline) return null;
  
  const timeRemaining = getTimeRemaining(deadline);
  
  if (timeRemaining.expired) {
    return 'This task is past the deadline and has been cancelled.';
  }
  
  const { days, hours, minutes } = timeRemaining;
  
  // Less than 1 hour remaining
  if (days === 0 && hours === 0 && minutes < 60) {
    return `Warning: This task expires in ${minutes} minutes!`;
  }
  
  // Less than 1 day remaining
  if (days === 0 && hours < 24) {
    return `Warning: This task expires in ${hours} hours!`;
  }
  
  return null;
};

/**
 * Format deadline for display
 * @param {string|Date} deadline - The deadline to format
 * @returns {string} - Formatted deadline string
 */
export const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline set';
  
  const deadlineDate = new Date(deadline);
  return deadlineDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Check if UPI ID operations are allowed (not expired)
 * @param {string|Date} deadline - The task completion deadline
 * @returns {boolean} - True if UPI ID operations are allowed
 */
export const canPerformUpiOperations = (deadline) => {
  return !isDeadlineExpired(deadline);
};

/**
 * Get UPI operation restriction message
 * @param {string|Date} deadline - The task completion deadline
 * @returns {string|null} - Restriction message or null if operations are allowed
 */
export const getUpiOperationRestriction = (deadline) => {
  if (canPerformUpiOperations(deadline)) return null;
  
  return 'UPI ID operations are not allowed as the task deadline has expired.';
};
