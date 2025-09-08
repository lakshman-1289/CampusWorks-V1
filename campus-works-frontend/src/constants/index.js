// =========================
// API Configuration
// =========================
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  ENDPOINTS: {
            // Authentication
        AUTH: {
          REGISTER: '/api/auth/register',
          LOGIN: '/api/auth/login',
          LOGOUT: '/api/auth/logout',
          VALIDATE: '/api/auth/validate',
          USER: '/api/auth/user',
          VERIFY: '/api/auth/verify',
          RESEND_VERIFICATION: '/api/auth/resend-verification',
          RESEND_VERIFICATION_PUBLIC: '/api/auth/resend-verification-public',
          VERIFICATION_STATUS: '/api/auth/verification-status',
          VALIDATE_EMAIL: '/api/auth/validate-email',
          DELETE_ACCOUNT: '/api/auth/delete-account',
          FORGOT_PASSWORD: '/api/auth/forgot-password',
          RESET_PASSWORD: '/api/auth/reset-password',
          CHANGE_PASSWORD: '/api/auth/change-password',
          TEST_AUTH: '/api/auth/test-auth'
        },
    
    // Tasks
    TASKS: {
      BASE: '/api/tasks',
      BY_STATUS: '/api/tasks/status',
      BY_CATEGORY: '/api/tasks/category',
      OPEN_FOR_BIDDING: '/api/tasks/open-for-bidding',
      BY_USER: '/api/tasks/user',
      BY_OWNER_EMAIL: '/api/tasks/owner-email',
      CAN_EDIT: '/api/tasks'
    },
    
    // Bidding
    BIDS: {
      BASE: '/api/bids',
      BY_TASK: '/api/bids/task',
      BY_USER: '/api/bids/user',
      BY_USER_EMAIL: '/api/bids/user/email',
      BY_STATUS: '/api/bids/status',
      AUTO_SELECT: '/api/bids/{taskId}/auto-select'
    },
    
    // Profiles
    PROFILES: {
      BASE: '/api/profiles',
      BY_USER: '/api/profiles/user',
      BY_EMAIL: '/api/profiles/user/email',
      BY_AVAILABILITY: '/api/profiles/availability'
    },
    
    // Payments
    PAYMENTS: {
      BASE: '/api/payments',
      CREATE: '/api/payments/tasks/{taskId}/create',
      ACCEPT: '/api/payments/tasks/{taskId}/accept',
      REJECT: '/api/payments/tasks/{taskId}/reject',
      WALLET: '/api/payments/wallet',
      TRANSACTIONS: '/api/payments/transactions'
    }
  }
};

// =========================
// Task Related Enums
// =========================
export const TASK_STATUS = {
  OPEN: 'OPEN',                    // Task is available for bidding
  IN_PROGRESS: 'IN_PROGRESS',      // Task assigned, work ongoing
  COMPLETED: 'COMPLETED',          // Work submitted by worker
  ACCEPTED: 'ACCEPTED',            // Work accepted by task owner
  CANCELLED: 'CANCELLED'           // Task cancelled
};

export const TASK_CATEGORIES = {
  ACADEMIC_WRITING: 'ACADEMIC_WRITING',    // Essays, research papers
  PROGRAMMING: 'PROGRAMMING',              // Software development
  MATHEMATICS: 'MATHEMATICS',              // Math problems, statistics
  SCIENCE: 'SCIENCE',                      // Physics, chemistry, biology
  LITERATURE: 'LITERATURE',                // Literary analysis
  ENGINEERING: 'ENGINEERING',              // Technical calculations
  OTHER: 'OTHER'                          // Miscellaneous tasks
};

// Category Display Labels
export const CATEGORY_LABELS = {
  ACADEMIC_WRITING: 'Academic Writing',
  PROGRAMMING: 'Programming',
  MATHEMATICS: 'Mathematics',
  SCIENCE: 'Science',
  LITERATURE: 'Literature',
  ENGINEERING: 'Engineering',
  OTHER: 'Other'
};

// =========================
// Bidding Related Enums
// =========================
export const BID_STATUS = {
  PENDING: 'PENDING',        // Bid is active, waiting for selection
  ACCEPTED: 'ACCEPTED',      // Bid won (selected by system/owner)
  REJECTED: 'REJECTED',      // Bid lost (not selected)
  WITHDRAWN: 'WITHDRAWN'     // Bid withdrawn by bidder
};

// =========================
// Profile Related Enums
// =========================
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'AVAILABLE',      // User available for new tasks
  BUSY: 'BUSY',               // User currently working
  UNAVAILABLE: 'UNAVAILABLE', // User not available
  ON_BREAK: 'ON_BREAK'        // User temporarily on break
};

// =========================
// Payment Related Enums
// =========================
export const PAYMENT_STATUS = {
  CREATED: 'CREATED',         // Payment order created
  PENDING: 'PENDING',         // Waiting for user payment
  PROCESSING: 'PROCESSING',   // Payment being processed
  COMPLETED: 'COMPLETED',     // Payment successful
  FAILED: 'FAILED',          // Payment failed
  REFUNDED: 'REFUNDED'       // Payment refunded
};

export const ESCROW_STATUS = {
  CREATED: 'CREATED',         // Escrow created, waiting for payment
  FUNDED: 'FUNDED',          // Payment received, money in escrow
  RELEASED: 'RELEASED',      // Money released to worker
  REFUNDED: 'REFUNDED',      // Money refunded to client
  DISPUTED: 'DISPUTED'       // Under dispute resolution
};

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',         // Transaction processing
  COMPLETED: 'COMPLETED',     // Transaction successful
  FAILED: 'FAILED',          // Transaction failed
  CANCELLED: 'CANCELLED'     // Transaction cancelled
};

export const TRANSACTION_TYPE = {
  ESCROW_FUNDED: 'ESCROW_FUNDED',           // Money deposited into escrow
  PAYMENT_RELEASED: 'PAYMENT_RELEASED',     // Payment released to worker
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',     // Payment refunded to client
  PLATFORM_FEE: 'PLATFORM_FEE',            // Platform fee deduction
  WALLET_DEPOSIT: 'WALLET_DEPOSIT',         // Money added to wallet
  WALLET_WITHDRAWAL: 'WALLET_WITHDRAWAL'    // Money withdrawn from wallet
};

export const WALLET_STATUS = {
  ACTIVE: 'ACTIVE',           // Wallet active and functional
  SUSPENDED: 'SUSPENDED',     // Wallet temporarily suspended
  CLOSED: 'CLOSED',          // Wallet permanently closed
  FROZEN: 'FROZEN'           // Wallet frozen due to issues
};

// =========================
// User Roles
// =========================
export const USER_ROLES = {
  STUDENT: 'STUDENT',         // Regular user (can post tasks AND bid)
  ADMIN: 'ADMIN'             // Administrator user
};

// =========================
// Status Display Labels
// =========================
export const STATUS_LABELS = {
  // Task Status Labels
  TASK_STATUS: {
    OPEN: 'Open for Bidding',
    IN_PROGRESS: 'Work in Progress',
    COMPLETED: 'Work Completed',
    ACCEPTED: 'Work Accepted',
    CANCELLED: 'Cancelled'
  },
  
  // Bid Status Labels
  BID_STATUS: {
    PENDING: 'Pending Review',
    ACCEPTED: 'Winning Bid',
    REJECTED: 'Not Selected',
    WITHDRAWN: 'Withdrawn'
  },
  
  // Availability Labels
  AVAILABILITY: {
    AVAILABLE: 'Available',
    BUSY: 'Currently Busy',
    UNAVAILABLE: 'Not Available',
    ON_BREAK: 'On Break'
  },
  
  // Payment Status Labels
  PAYMENT_STATUS: {
    CREATED: 'Payment Created',
    PENDING: 'Payment Pending',
    PROCESSING: 'Processing Payment',
    COMPLETED: 'Payment Completed',
    FAILED: 'Payment Failed',
    REFUNDED: 'Payment Refunded'
  }
};

// =========================
// Status Colors for UI
// =========================
export const STATUS_COLORS = {
  // Task Status Colors
  TASK_STATUS: {
    OPEN: '#2196F3',           // Blue
    IN_PROGRESS: '#FF9800',    // Orange
    COMPLETED: '#4CAF50',      // Green
    ACCEPTED: '#8BC34A',       // Light Green
    CANCELLED: '#F44336'       // Red
  },
  
  // Bid Status Colors
  BID_STATUS: {
    PENDING: '#FFC107',        // Amber
    ACCEPTED: '#4CAF50',       // Green
    REJECTED: '#F44336',       // Red
    WITHDRAWN: '#9E9E9E'       // Grey
  },
  
  // Availability Colors
  AVAILABILITY: {
    AVAILABLE: '#4CAF50',      // Green
    BUSY: '#FF9800',          // Orange
    UNAVAILABLE: '#F44336',    // Red
    ON_BREAK: '#9C27B0'       // Purple
  }
};

// =========================
// Validation Constants
// =========================
export const VALIDATION_LIMITS = {
  TASK: {
    TITLE_MIN_LENGTH: 5,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 1000,
    MIN_BUDGET: 50.00,
    MAX_BUDGET: 10000.00
  },
  
  BID: {
    PROPOSAL_MIN_LENGTH: 10,
    PROPOSAL_MAX_LENGTH: 500,
    MIN_AMOUNT: 50.00,
    MAX_AMOUNT: 10000.00
  },
  
  PROFILE: {
    FIRST_NAME_MAX_LENGTH: 50,
    LAST_NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 500,
    UNIVERSITY_MAX_LENGTH: 100,
    MAJOR_MAX_LENGTH: 100,
    MIN_ACADEMIC_YEAR: 1,
    MAX_ACADEMIC_YEAR: 8,
    MIN_EXPERIENCE_YEARS: 0,
    MAX_EXPERIENCE_YEARS: 20,
    MIN_HOURLY_RATE: 5.00,
    MAX_HOURLY_RATE: 1000.00
  }
};

// =========================
// App Configuration
// =========================
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'CampusWorks',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
  ENABLE_REDUX_DEVTOOLS: import.meta.env.VITE_ENABLE_REDUX_DEVTOOLS === 'true'
};

// =========================
// Local Storage Keys
// =========================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'campusworks_auth_token',
  USER_DATA: 'campusworks_user_data',
  THEME_MODE: 'campusworks_theme_mode'
};

// =========================
// Route Paths
// =========================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
  CREATE_TASK: '/tasks/create',
  EDIT_TASK: '/tasks/:id/edit',
  MY_TASKS: '/my-tasks',
  BIDS: '/bids',
  MY_BIDS: '/my-bids',
  BID_DETAIL: '/bids/:id',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  PAYMENTS: '/payments',
  WALLET: '/wallet',
  TRANSACTIONS: '/transactions'
};
