// =============================================
// Countdown Utility Functions
// =============================================
// Handles real-time countdown calculations and formatting

/**
 * Calculate time remaining until a deadline
 * @param {string|Date} deadline - The deadline date
 * @returns {Object} - Object containing days, hours, minutes, seconds
 */
export const calculateTimeRemaining = (deadline) => {
  if (!deadline) {
    console.warn('calculateTimeRemaining: No deadline provided');
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isExpired: true
    };
  }
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  console.log('calculateTimeRemaining - now:', now);
  console.log('calculateTimeRemaining - deadline:', deadline);
  console.log('calculateTimeRemaining - deadlineDate:', deadlineDate);
  
  const timeDiff = deadlineDate.getTime() - now.getTime();
  console.log('calculateTimeRemaining - timeDiff:', timeDiff);

  if (timeDiff <= 0) {
    console.log('calculateTimeRemaining - deadline expired');
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isExpired: true
    };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    total: timeDiff,
    isExpired: false
  };
};

/**
 * Format countdown time as "X days : Y hours : Z min : W sec"
 * @param {Object} timeRemaining - Time remaining object from calculateTimeRemaining
 * @returns {string} - Formatted countdown string
 */
export const formatCountdown = (timeRemaining) => {
  if (timeRemaining.isExpired) {
    return "Expired";
  }

  const { days, hours, minutes, seconds } = timeRemaining;
  
  return `${days} days : ${hours} hours : ${minutes} min : ${seconds} sec`;
};

/**
 * Get countdown color based on time remaining
 * @param {Object} timeRemaining - Time remaining object
 * @returns {string} - Color class or hex color
 */
export const getCountdownColor = (timeRemaining) => {
  if (timeRemaining.isExpired) {
    return '#f44336'; // Red for expired
  }

  const { days, hours, total } = timeRemaining;
  const totalHours = days * 24 + hours;

  if (totalHours <= 1) {
    return '#f44336'; // Red for critical (1 hour or less)
  } else if (totalHours <= 6) {
    return '#ff9800'; // Orange for warning (1-6 hours)
  } else if (totalHours <= 24) {
    return '#ffc107'; // Yellow for caution (6-24 hours)
  } else {
    return '#4caf50'; // Green for good (more than 24 hours)
  }
};

/**
 * Get countdown urgency level
 * @param {Object} timeRemaining - Time remaining object
 * @returns {string} - Urgency level
 */
export const getCountdownUrgency = (timeRemaining) => {
  if (timeRemaining.isExpired) {
    return 'expired';
  }

  const { days, hours } = timeRemaining;
  const totalHours = days * 24 + hours;

  if (totalHours <= 1) {
    return 'critical';
  } else if (totalHours <= 6) {
    return 'warning';
  } else if (totalHours <= 24) {
    return 'caution';
  } else {
    return 'good';
  }
};

/**
 * Check if countdown should blink (for critical time)
 * @param {Object} timeRemaining - Time remaining object
 * @returns {boolean} - Whether countdown should blink
 */
export const shouldCountdownBlink = (timeRemaining) => {
  if (timeRemaining.isExpired) {
    return false;
  }

  const { days, hours } = timeRemaining;
  const totalHours = days * 24 + hours;

  return totalHours <= 1; // Blink if 1 hour or less
};

/**
 * Get countdown status text
 * @param {Object} timeRemaining - Time remaining object
 * @returns {string} - Status text
 */
export const getCountdownStatus = (timeRemaining) => {
  if (timeRemaining.isExpired) {
    return 'Deadline Passed';
  }

  const { days, hours } = timeRemaining;
  const totalHours = days * 24 + hours;

  if (totalHours <= 1) {
    return 'Critical - Less than 1 hour remaining';
  } else if (totalHours <= 6) {
    return 'Warning - Less than 6 hours remaining';
  } else if (totalHours <= 24) {
    return 'Caution - Less than 24 hours remaining';
  } else {
    return 'Good - Plenty of time remaining';
  }
};
