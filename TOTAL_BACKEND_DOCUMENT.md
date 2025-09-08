# 🎓 CampusWorks - Complete Backend Documentation

> **Version**: 3.0.0 | **Last Updated**: January 2024  
> **Framework**: Spring Boot 3.4.0 + Spring Cloud 2024.0.1 | **Java**: 17  
> **Architecture**: Microservices with API Gateway Pattern

---

## 📋 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [System Architecture](#-system-architecture)
3. [Service Discovery & API Gateway](#-service-discovery--api-gateway)
4. [Authentication & Authorization](#-authentication--authorization)
5. [Microservices Documentation](#-microservices-documentation)
6. [Business Workflows](#-business-workflows)
7. [Inter-Service Communication](#-inter-service-communication)
8. [Database Architecture](#-database-architecture)
9. [API Reference by Business Function](#-api-reference-by-business-function)
10. [Frontend Integration Guide](#-frontend-integration-guide)
11. [Testing & Validation](#-testing--validation)
12. [Deployment Guide](#-deployment-guide)
13. [Error Handling](#-error-handling)
14. [Security Considerations](#-security-considerations)
15. [Troubleshooting Guide](#-troubleshooting-guide)
16. [Configuration Templates](#-configuration-templates)

---

## 🎯 Executive Summary

**CampusWorks** is a peer-to-peer academic record outsourcing platform where students can post offline record/assignment tasks with budgets, other students bid on them, and the lowest bidder wins. The platform features **automatic bid selection**, **custom escrow logic tied to task deadlines**, and **comprehensive payment processing**.

### 🔑 Key Business Features
- **Single Role System**: All users are STUDENTS (except one admin)
- **Automatic Bid Selection**: System selects lowest bidder when deadline expires
- **Custom Escrow Logic**: Payment held until task deadline (not fixed 30 days)
- **Owner Bidding Restriction**: Task owners cannot bid on their own tasks
- **Real-time Payment Processing**: Razorpay integration with webhooks
- **Comprehensive Rating System**: User reputation and work history tracking

### 🏗️ Technical Architecture
- **7 Microservices**: Eureka, Gateway, Auth, Task, Bidding, Profile, Payment
- **Service Discovery**: Netflix Eureka with automatic registration
- **API Gateway**: Centralized routing, JWT validation, CORS handling
- **Database**: MySQL with separate databases per service
- **Payment Gateway**: Razorpay integration with webhook processing
- **Circuit Breakers**: Resilience4j for fault tolerance

---

## 🏗️ System Architecture

### 📊 Service Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Eureka Server  │    │  API Gateway    │    │  Auth Service   │
│   Port: 8761    │◄──►│   Port: 8080    │◄──►│   Port: 9000    │
│                 │    │                 │    │                 │
│ • Service Reg   │    │ • JWT Auth      │    │ • User Reg      │
│ • Discovery     │    │ • Routing       │    │ • Login/Token   │
│ • Health Check  │    │ • CORS          │    │ • Role Mgmt     │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Task Service   │    │ Bidding Service │    │ Profile Service │
│   Port: 9001    │◄──►│   Port: 9002    │◄──►│   Port: 9003    │
│                 │    │                 │    │                 │
│ • Task CRUD     │    │ • Bid Mgmt      │    │ • User Profiles │
│ • Status Mgmt   │    │ • Auto Select   │    │ • Ratings       │
│ • Deadlines     │    │ • Owner Block   │    │ • Work History  │
└─────────────────┘    └─────────────────┘    └─────────────────┘

                       ┌─────────────────┐
                       │ Payment Service │
                       │   Port: 8084    │
                       │                 │
                       │ • Razorpay      │
                       │ • Escrow Mgmt   │
                       │ • Wallet System │
                       └─────────────────┘
```

### 🔄 Request Flow

1. **Client** → **API Gateway** (JWT validation)
2. **API Gateway** → **Microservice** (with user headers)
3. **Microservice** → **Other Services** (Feign Client)
4. **Response** ← **API Gateway** ← **Microservice**

---

## 🔍 Service Discovery & API Gateway

### Eureka Server (Port: 8761)

**Purpose**: Central service registry and discovery hub

**Key Features**:
- Automatic service registration and deregistration
- Health monitoring with fast eviction
- Load balancing support for client-side discovery
- Web dashboard for service monitoring

**Configuration**:
```properties
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.server.enable-self-preservation=false
```

**Health Check**: `GET http://localhost:8761/actuator/health`

### API Gateway (Port: 8080)

**Purpose**: Single entry point with JWT authentication and routing

**Key Features**:
- **JWT Token Validation**: Validates and extracts user claims
- **Header Propagation**: Adds `X-User-Id`, `X-User-Email`, `X-User-Roles`
- **Service Routing**: Routes to appropriate microservices
- **CORS Configuration**: Global CORS handling for frontend
- **Load Balancing**: Automatic load balancing via Eureka

**Routes Configuration**:
```properties
# Auth Service
/api/auth/** → auth-service

# Task Service  
/api/tasks/** → task-service

# Bidding Service
/api/bids/** → bidding-service

# Profile Service
/api/profiles/** → profile-service

# Payment Service
/api/payments/** → payment-service
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

**Claims**:
- `sub`: User email
- `userId`: User ID (Long)
- `role`: User role (STUDENT/ADMIN)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

**Token Example**:
```json
{
  "sub": "student@example.com",
  "userId": 123,
  "role": "STUDENT",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Header Propagation

**API Gateway automatically adds these headers to downstream services**:
```http
X-User-Id: 123
X-User-Email: student@example.com
X-User-Roles: STUDENT
```

### Role-Based Access Control

**Roles**:
- **STUDENT**: Default role for all users (can post tasks AND bid on tasks)
- **ADMIN**: Single admin user (created automatically on startup)

**Access Control**:
- **Public Endpoints**: `/auth/register`, `/auth/login`, health checks
- **Protected Endpoints**: All other endpoints require valid JWT
- **Admin Endpoints**: Admin-specific operations (rare)

---

## 📋 Microservices Documentation

## 1. 🔐 Auth Service (Port: 9000)

**Purpose**: User authentication, registration, and JWT token management

**Database**: `campusworks_auth`

**Key Features**:
- User registration with automatic STUDENT role assignment
- JWT token generation and validation
- Password encryption with BCrypt
- Automatic admin user creation on startup

### API Endpoints
base url  { http://localhost:8080}
#### POST `/auth/register`
**Purpose**: Register a new user (automatically assigned STUDENT role)

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully as STUDENT",
  "userId": 123,
  "email": "student@example.com",
  "role": "STUDENT"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securePassword123"
  }'
```

#### POST `/auth/login`
**Purpose**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "student@example.com"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securePassword123"
  }'
```

#### GET `/auth/user/{email}`
**Purpose**: Get user information by email

**Response (200)**:
```json
{
  "userId": 123,
  "email": "student@example.com",
  "role": "STUDENT",
  "enabled": true
}
```

---

## 2. 📝 Task Service (Port: 9001)

**Purpose**: Task creation, management, and lifecycle handling

**Database**: `campusworks_tasks`

**Key Features**:
- Task CRUD operations with validation
- Automatic bidding deadline calculation (1 hour from creation)
- Task status management (OPEN → ASSIGNED → COMPLETED)
- Owner verification for task operations

### Task Lifecycle States

```
OPEN → IN_PROGRESS → COMPLETED → ACCEPTED
  ↓         ↓           ↓          ↓
CANCELLED CANCELLED   CANCELLED  CANCELLED
```

**Task Status Enum Values**:
- `OPEN` - Task is available for bidding
- `IN_PROGRESS` - Task has been assigned and work is ongoing
- `COMPLETED` - Work has been submitted by worker
- `ACCEPTED` - Work has been accepted by task owner
- `CANCELLED` - Task has been cancelled

**Task Category Enum Values**:
- `ACADEMIC_WRITING` - Essays, research papers, reports
- `PROGRAMMING` - Software development, coding tasks
- `MATHEMATICS` - Math problems, calculations, statistics
- `SCIENCE` - Physics, chemistry, biology assignments
- `LITERATURE` - Literary analysis, creative writing
- `ENGINEERING` - Technical drawings, calculations
- `OTHER` - Miscellaneous academic tasks

### API Endpoints

#### POST `/tasks`
**Purpose**: Create a new task

**Headers Required**:
```http
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "title": "Math Assignment Help",
  "description": "Need help with calculus problems for my engineering course",
  "budget": 50.00,
  "category": "MATHEMATICS",
  "completionDeadline": "2024-01-20T23:59:59"
}
```

**Response (201)**:
```json
{
  "message": "Task created successfully",
  "taskId": 1,
  "title": "Math Assignment Help",
  "status": "OPEN",
  "biddingDeadline": "2024-01-10T15:30:00",
  "completionDeadline": "2024-01-20T23:59:59",
  "budget": 50.00,
  "category": "MATHEMATICS"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Math Assignment Help",
    "description": "Need help with calculus problems",
    "budget": 50.00,
    "category": "MATHEMATICS",
    "completionDeadline": "2024-01-20T23:59:59"
  }'
```

#### GET `/tasks`
**Purpose**: Get all tasks (paginated)

**Query Parameters**:
- `page` (default: 0)
- `size` (default: 10)
- `status` (optional): Filter by status
- `category` (optional): Filter by category

**Response (200)**:
```json
[
  {
    "id": 1,
    "title": "Math Assignment Help",
    "description": "Need help with calculus problems",
    "budget": 50.00,
    "category": "MATHEMATICS",
    "status": "OPEN",
    "ownerId": 123,
    "ownerEmail": "student@example.com",
    "biddingDeadline": "2024-01-10T15:30:00",
    "completionDeadline": "2024-01-20T23:59:59",
    "createdAt": "2024-01-10T14:30:00"
  }
]
```

#### GET `/tasks/{id}`
**Purpose**: Get specific task by ID

**Response (200)**:
```json
{
  "id": 1,
  "title": "Math Assignment Help",
  "description": "Need help with calculus problems for my engineering course",
  "budget": 50.00,
  "category": "MATHEMATICS",
  "status": "OPEN",
  "ownerId": 123,
  "ownerEmail": "student@example.com",
  "assignedUserId": null,
  "assignedUserEmail": null,
  "biddingDeadline": "2024-01-10T15:30:00",
  "completionDeadline": "2024-01-20T23:59:59",
  "createdAt": "2024-01-10T14:30:00",
  "updatedAt": "2024-01-10T14:30:00"
}
```

#### GET `/tasks/open-for-bidding`
**Purpose**: Get tasks available for bidding

**Response (200)**:
```json
[
  {
    "id": 1,
    "title": "Math Assignment Help",
    "budget": 50.00,
    "category": "MATHEMATICS",
    "biddingDeadline": "2024-01-10T15:30:00",
    "completionDeadline": "2024-01-20T23:59:59",
    "timeLeftToBid": "25 minutes"
  }
]
```

#### GET `/tasks/status/{status}`
**Purpose**: Get tasks by status

**Path Parameters**:
- `status`: One of `OPEN`, `IN_PROGRESS`, `COMPLETED`, `ACCEPTED`, `CANCELLED`

**Example**: `GET /api/tasks/status/IN_PROGRESS`

**Response (200)**:
```json
[
  {
    "id": 2,
    "title": "Programming Assignment",
    "status": "IN_PROGRESS",
    "assignedUserId": 456,
    "assignedUserEmail": "worker@example.com",
    "completionDeadline": "2024-01-25T23:59:59"
  }
]
```

**Error Response (400)**:
```json
{
  "error": "Invalid status",
  "message": "Status must be one of: OPEN, IN_PROGRESS, COMPLETED, ACCEPTED, CANCELLED"
}
```

#### GET `/tasks/category/{category}`
**Purpose**: Get tasks by category

**Path Parameters**:
- `category`: One of the task categories (case-insensitive)

**Example**: `GET /api/tasks/category/PROGRAMMING`

**Response (200)**:
```json
[
  {
    "id": 3,
    "title": "Build React Component",
    "category": "PROGRAMMING",
    "budget": 150.00,
    "status": "OPEN",
    "biddingDeadline": "2024-01-15T15:30:00"
  }
]
```

**Error Response (400)**:
```json
{
  "error": "Invalid category",
  "message": "Category must be one of: ACADEMIC_WRITING, PROGRAMMING, MATHEMATICS, SCIENCE, LITERATURE, HISTORY, BUSINESS, ENGINEERING, MEDICINE, LAW, OTHER"
}
```

#### PUT `/tasks/{id}/status`
**Purpose**: Update task status (internal use by other services)

**Request Body**:
```json
{
  "status": "ASSIGNED",
  "assignedUserId": 456,
  "assignedUserEmail": "worker@example.com"
}
```

#### GET `/tasks/{taskId}/ownership/{userId}`
**Purpose**: Check if user owns a task (for bidding restriction)

**Headers Required**:
```http
X-User-Id: 123
X-User-Email: student@example.com
X-User-Roles: STUDENT
```

**Response (200)**:
```json
{
  "taskId": 1,
  "userId": 123,
  "isOwner": true,
  "message": "User is the task owner",
  "success": true
}
```

---

## 3. 🏷️ Bidding Service (Port: 9002)

**Purpose**: Bid management, automatic bid selection, and owner bidding restriction

**Database**: `campusworks_bids`

**Key Features**:
- Bid placement with validation
- **Automatic bid selection** when bidding deadline expires
- **Owner bidding restriction** (owners cannot bid on their own tasks)
- Bid status management and statistics
- **Scheduled tasks** for deadline monitoring

### Automatic Bid Selection Logic

```
1. Scheduled task runs every 5 minutes
2. Finds tasks with expired bidding deadlines
3. Selects lowest bid for each task
4. Updates task status to ASSIGNED
5. Notifies task and profile services
6. Logs all actions for audit trail
```

**Bid Status Enum Values**:
- `PENDING` - Bid is active and waiting for selection
- `ACCEPTED` - Bid has been accepted (winning bid)
- `REJECTED` - Bid has been rejected (losing bid)
- `WITHDRAWN` - Bid has been withdrawn by bidder

### API Endpoints

#### POST `/bids`
**Purpose**: Place a new bid on a task

**Headers Required**:
```http
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "taskId": 1,
  "amount": 45.00,
  "proposal": "I have 3 years of experience in calculus and can complete this within 2 days"
}
```

**Response (201)**:
```json
{
  "message": "Bid placed successfully",
  "bidId": 10,
  "taskId": 1,
  "amount": 45.00,
  "status": "PENDING",
  "bidderId": 456,
  "bidderEmail": "worker@example.com",
  "placedAt": "2024-01-10T14:45:00"
}
```

**Error Response (400) - Owner Bidding**:
```json
{
  "error": "Failed to place bid",
  "message": "Task owners cannot bid on their own tasks"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/bids \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "amount": 45.00,
    "proposal": "I can help with this calculus assignment"
  }'
```

#### GET `/bids/task/{taskId}`
**Purpose**: Get all bids for a specific task

**Response (200)**:
```json
[
  {
    "id": 10,
    "taskId": 1,
    "bidderId": 456,
    "bidderEmail": "worker@example.com",
    "amount": 45.00,
    "proposal": "I have experience in calculus",
    "status": "PENDING",
    "isWinning": false,
    "createdAt": "2024-01-10T14:45:00"
  },
  {
    "id": 11,
    "taskId": 1,
    "bidderId": 789,
    "bidderEmail": "helper@example.com",
    "amount": 40.00,
    "proposal": "Mathematics expert available",
    "status": "WINNING",
    "isWinning": true,
    "createdAt": "2024-01-10T14:50:00"
  }
]
```

#### GET `/bids/user/{userId}`
**Purpose**: Get all bids placed by a user

**Response (200)**:
```json
[
  {
    "id": 10,
    "taskId": 1,
    "taskTitle": "Math Assignment Help",
    "amount": 45.00,
    "status": "PENDING",
    "isWinning": false,
    "placedAt": "2024-01-10T14:45:00"
  }
]
```

#### GET `/bids/tasks/ready-for-selection`
**Purpose**: Get tasks ready for automatic bid selection (Admin/Internal)

**Response (200)**:
```json
[
  {
    "taskId": 1,
    "title": "Math Assignment Help",
    "biddingDeadline": "2024-01-10T15:30:00",
    "totalBids": 3,
    "lowestBid": 40.00,
    "status": "READY_FOR_SELECTION"
  }
]
```

#### GET `/bids/status/{status}`
**Purpose**: Get bids by status

**Path Parameters**:
- `status`: One of `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`

**Example**: `GET /api/bids/status/PENDING`

**Response (200)**:
```json
[
  {
    "id": 10,
    "taskId": 1,
    "bidderId": 456,
    "bidderEmail": "worker@example.com",
    "amount": 45.00,
    "status": "PENDING",
    "createdAt": "2024-01-10T14:45:00"
  }
]
```

**Error Response (400)**:
```json
{
  "error": "Invalid status",
  "message": "Status must be one of: PENDING, ACCEPTED, REJECTED, WITHDRAWN"
}
```

#### POST `/bids/{taskId}/auto-select`
**Purpose**: Manually trigger automatic bid selection for a task

**Headers Required**:
```http
Authorization: Bearer <admin-jwt-token>
```

**Response (200)**:
```json
{
  "message": "Automatic bid selection triggered successfully",
  "taskId": 1,
  "selectedBidId": 11,
  "winningAmount": 40.00,
  "winnerEmail": "helper@example.com",
  "triggeredAt": "2024-01-10T15:35:00"
}
```

---

## 4. 👤 Profile Service (Port: 9003)

**Purpose**: User profile management, ratings, and work history tracking

**Database**: `campusworks_profile`

**Key Features**:
- Comprehensive user profiles with academic information
- Rating system (1-5 stars) with detailed feedback
- Work history and earnings tracking
- Skill and category preferences
- Public/private profile visibility

**Profile Availability Status Enum Values**:
- `AVAILABLE` - User is available for new tasks
- `BUSY` - User is currently working on tasks
- `UNAVAILABLE` - User is not available for work
- `ON_BREAK` - User is temporarily on break

### API Endpoints

#### POST `/profiles`
**Purpose**: Create a new user profile

**Headers Required**:
```http
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Computer Science student with expertise in web development",
  "university": "Tech University",
  "major": "Computer Science",
  "academicYear": 3,
  "skills": ["Java", "Spring Boot", "React", "MySQL"],
  "experienceYears": 2,
  "experienceDescription": "Worked on multiple web projects",
  "preferredCategories": ["COMPUTER_SCIENCE", "WEB_DEVELOPMENT"],
  "hourlyRate": 25.00,
  "availabilityStatus": "AVAILABLE",
  "isPublic": true
}
```

**Response (201)**:
```json
{
  "message": "Profile created successfully",
  "profileId": 5,
  "displayName": "John Smith",
  "isComplete": true
}
```

#### GET `/profiles/user/{userId}`
**Purpose**: Get profile by user ID

**Response (200)**:
```json
{
  "id": 5,
  "userId": 123,
  "userEmail": "john@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "displayName": "John Smith",
  "bio": "Computer Science student with expertise in web development",
  "university": "Tech University",
  "major": "Computer Science",
  "academicYear": 3,
  "skills": ["Java", "Spring Boot", "React", "MySQL"],
  "experienceYears": 2,
  "rating": 4.5,
  "totalRatings": 12,
  "completedTasks": 15,
  "successfulTasks": 14,
  "totalEarnings": 750.00,
  "isVerified": false,
  "isPublic": true,
  "availabilityStatus": "AVAILABLE",
  "lastActive": "2024-01-10T14:30:00"
}
```

#### PUT `/profiles/user/{userId}/rating`
**Purpose**: Add rating to a user's profile

**Request Body**:
```json
{
  "rating": 5,
  "feedback": "Excellent work, completed on time with great quality"
}
```

**Response (200)**:
```json
{
  "message": "Rating added successfully",
  "newAverageRating": 4.6,
  "totalRatings": 13
}
```

#### GET `/profiles/availability/{status}`
**Purpose**: Get profiles by availability status

**Path Parameters**:
- `status`: One of `AVAILABLE`, `BUSY`, `UNAVAILABLE`, `ON_BREAK`

**Example**: `GET /api/profiles/availability/AVAILABLE`

**Response (200)**:
```json
[
  {
    "id": 5,
    "userId": 123,
    "displayName": "John Smith",
    "availabilityStatus": "AVAILABLE",
    "rating": 4.5,
    "totalRatings": 12,
    "completedTasks": 15
  }
]
```

**Error Response (400)**:
```json
{
  "error": "Invalid availability status",
  "message": "Status must be one of: AVAILABLE, BUSY, UNAVAILABLE, ON_BREAK"
}
```

#### PUT `/profiles/user/{userId}/earnings`
**Purpose**: Update user earnings (called by Payment Service)

**Request Body**:
```json
{
  "amount": 95.00,
  "taskId": 1,
  "description": "Earnings from completed task",
  "paymentReference": "razorpay_payment_123"
}
```

---

## 5. 💰 Payment Service (Port: 8084)

**Purpose**: Payment processing, escrow management, and financial transactions

**Database**: `campusworks_payment`

**Key Features**:
- **Razorpay integration** for payment processing
- **Custom escrow logic** tied to task deadlines
- **Wallet system** for user balance management
- **Webhook processing** for real-time updates
- **Scheduled tasks** for deadline monitoring
- **Transaction history** and audit trails

### Custom Business Logic

**🔥 Key Innovation: Escrow Tied to Task Deadline**
- Traditional systems use fixed escrow periods (30 days)
- CampusWorks ties escrow expiration to task completion deadline
- More predictable and fair for both clients and workers

**Escrow Flow**:
```
1. Work Completed & Accepted → Money released immediately ✅
2. Work Rejected by Owner → Money refunded immediately ✅  
3. No Work by Deadline → Auto-refund at deadline expiration ✅
```

**Payment Status Enum Values**:
- `CREATED` - Payment order created in Razorpay
- `PENDING` - Waiting for user to complete payment
- `PROCESSING` - Payment being processed by gateway
- `COMPLETED` - Payment successful and confirmed
- `FAILED` - Payment failed or declined
- `REFUNDED` - Payment has been refunded

**Escrow Status Enum Values**:
- `CREATED` - Escrow created, waiting for payment
- `FUNDED` - Payment received, money held in escrow
- `RELEASED` - Money released to worker
- `REFUNDED` - Money refunded to client
- `DISPUTED` - Under dispute resolution

**Transaction Status Enum Values**:
- `PENDING` - Transaction is being processed
- `COMPLETED` - Transaction completed successfully
- `FAILED` - Transaction failed
- `CANCELLED` - Transaction was cancelled

**Transaction Type Enum Values**:
- `ESCROW_FUNDED` - Money deposited into escrow
- `PAYMENT_RELEASED` - Payment released to worker
- `PAYMENT_REFUNDED` - Payment refunded to client
- `PLATFORM_FEE` - Platform fee deduction
- `WALLET_DEPOSIT` - Money added to wallet
- `WALLET_WITHDRAWAL` - Money withdrawn from wallet

**Wallet Status Enum Values**:
- `ACTIVE` - Wallet is active and functional
- `SUSPENDED` - Wallet is temporarily suspended
- `CLOSED` - Wallet is permanently closed
- `FROZEN` - Wallet is frozen due to issues

### API Endpoints

#### POST `/payments/tasks/{taskId}/create`
**Purpose**: Create payment for winning bid

**Headers Required**:
```http
Authorization: Bearer <jwt-token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Payment created successfully",
  "payment": {
    "id": 1,
    "taskId": 1,
    "amount": 100.00,
    "platformFee": 5.00,
    "workerAmount": 95.00,
    "status": "CREATED",
    "razorpayOrderId": "order_ABC123",
    "currency": "INR"
  },
  "escrow": {
    "id": 1,
    "taskId": 1,
    "totalAmount": 100.00,
    "status": "CREATED",
    "expiresAt": "2024-01-20T23:59:59",
    "canBeReleased": false,
    "canBeRefunded": true
  }
}
```

#### POST `/payments/tasks/{taskId}/accept`
**Purpose**: Accept work and release payment

**Headers Required**:
```http
Authorization: Bearer <client-jwt-token>
```

**Request Body**:
```json
{
  "reason": "Work completed successfully, meets all requirements"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Work accepted and payment released successfully",
  "payment": {
    "id": 1,
    "status": "COMPLETED",
    "completedAt": "2024-01-15T10:30:00"
  },
  "escrow": {
    "id": 1,
    "status": "RELEASED",
    "releasedAt": "2024-01-15T10:30:00",
    "releaseReason": "Work completed successfully"
  },
  "transaction": {
    "id": 15,
    "type": "PAYMENT_RELEASED",
    "amount": 95.00,
    "description": "Payment released for completed task"
  }
}
```

#### POST `/payments/tasks/{taskId}/reject`
**Purpose**: Reject work and refund payment

**Request Body**:
```json
{
  "reason": "Work does not meet requirements, needs revision"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Work rejected and payment refunded successfully",
  "escrow": {
    "status": "REFUNDED",
    "refundedAt": "2024-01-15T10:30:00"
  },
  "transaction": {
    "type": "PAYMENT_REFUNDED",
    "amount": 100.00
  }
}
```

#### GET `/payments/wallet`
**Purpose**: Get user wallet information

**Response (200)**:
```json
{
  "success": true,
  "wallet": {
    "id": 5,
    "userId": 123,
    "balance": 1250.00,
    "totalEarned": 2500.00,
    "totalSpent": 1000.00,
    "totalRefunded": 250.00,
    "status": "ACTIVE",
    "lastTransactionAt": "2024-01-15T10:30:00"
  }
}
```

#### GET `/payments/transactions`
**Purpose**: Get user transaction history

**Query Parameters**:
- `page` (default: 0)
- `size` (default: 10)

**Response (200)**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": 15,
      "type": "PAYMENT_RELEASED",
      "amount": 95.00,
      "status": "COMPLETED",
      "description": "Payment released for completed task",
      "balanceBefore": 1155.00,
      "balanceAfter": 1250.00,
      "createdAt": "2024-01-15T10:30:00"
    }
  ]
}
```

---

## 🔄 Business Workflows

### 1. 📝 Task Creation & Bidding Workflow

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway  
    participant T as Task Service
    participant B as Bidding Service
    participant P as Profile Service

    C->>G: POST /api/tasks (Create Task)
    G->>T: Forward with user headers
    T->>T: Create task with OPEN status
    T->>T: Set bidding deadline (+1 hour)
    T->>G: Return task details
    G->>C: Task created successfully

    Note over B: Workers can now place bids

    C->>G: POST /api/bids (Place Bid)
    G->>B: Forward with user headers
    B->>T: Check task ownership (Feign)
    T->>B: Return ownership status
    B->>B: Validate: owner cannot bid
    B->>B: Create bid with PENDING status
    B->>G: Return bid confirmation
    G->>C: Bid placed successfully

    Note over B: Automatic Selection (Scheduled)
    
    B->>B: Scheduler: Check expired deadlines
    B->>T: Get tasks ready for assignment
    B->>B: Select lowest bid
    B->>T: Update task status to ASSIGNED
    B->>P: Update winner's profile stats
```

### 2. 💰 Payment & Escrow Workflow

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant Pay as Payment Service
    participant R as Razorpay
    participant T as Task Service
    participant Prof as Profile Service

    C->>G: POST /api/payments/tasks/{id}/create
    G->>Pay: Forward with user headers
    Pay->>T: Get task details (Feign)
    Pay->>B: Get winning bid (Feign)
    Pay->>R: Create Razorpay order
    Pay->>Pay: Create payment record
    Pay->>Pay: Create escrow (expires at task deadline)
    Pay->>G: Return payment & escrow details
    G->>C: Payment created, redirect to Razorpay

    C->>R: Complete payment via Razorpay UI
    R->>Pay: Webhook: payment.captured
    Pay->>Pay: Verify webhook signature
    Pay->>Pay: Update payment status to COMPLETED
    Pay->>Pay: Fund escrow (status: FUNDED)

    Note over C: Worker completes work offline

    C->>G: POST /api/payments/tasks/{id}/accept
    G->>Pay: Forward with user headers
    Pay->>Pay: Release escrow to worker
    Pay->>Prof: Update worker earnings (Feign)
    Pay->>T: Update task status to COMPLETED
    Pay->>G: Return success response
    G->>C: Work accepted, payment released
```

### 3. ⏰ Automatic Deadline Handling

```mermaid
sequenceDiagram
    participant S as Scheduler
    participant Pay as Payment Service
    participant T as Task Service
    participant Prof as Profile Service

    Note over S: Runs every hour

    S->>Pay: Check expired escrows
    Pay->>Pay: Find escrows past task deadline
    Pay->>Pay: Auto-refund to client
    Pay->>Prof: Update client refund stats
    Pay->>T: Mark task as FAILED/REOPENED
    Pay->>Pay: Create refund transaction
    Pay->>Pay: Log automatic action

    Note over Pay: Client gets money back automatically
    Note over T: Task reopened for new bids
```

---

## 🔗 Inter-Service Communication

### Feign Client Configuration

**All services use Feign Clients with**:
- **Circuit Breakers**: Resilience4j for fault tolerance
- **Header Propagation**: JWT claims forwarded automatically
- **Fallback Mechanisms**: Graceful degradation when services unavailable
- **Load Balancing**: Client-side load balancing via Eureka

### Example Feign Client

```java
@FeignClient(name = "task-service", fallback = TaskServiceClientFallback.class)
public interface TaskServiceClient {
    
    @GetMapping("/tasks/{taskId}")
    TaskResponse getTask(@PathVariable Long taskId,
                        @RequestHeader("X-User-Id") String userId,
                        @RequestHeader("X-User-Email") String userEmail,
                        @RequestHeader("X-User-Roles") String userRoles);
    
    @PutMapping("/tasks/{taskId}/status")
    void updateTaskStatus(@PathVariable Long taskId, 
                         @RequestBody TaskStatusUpdateRequest request,
                         @RequestHeader("X-User-Id") String userId,
                         @RequestHeader("X-User-Email") String userEmail,
                         @RequestHeader("X-User-Roles") String userRoles);
}
```

### Header Propagation Configuration

```java
@Configuration
public class FeignClientConfig {
    
    @Bean
    public RequestInterceptor authHeaderInterceptor() {
        return template -> {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                String userId = request.getHeader("X-User-Id");
                String userEmail = request.getHeader("X-User-Email");
                String userRoles = request.getHeader("X-User-Roles");
                
                if (userId != null) template.header("X-User-Id", userId);
                if (userEmail != null) template.header("X-User-Email", userEmail);
                if (userRoles != null) template.header("X-User-Roles", userRoles);
            }
        };
    }
}
```

---

## 🗄️ Database Architecture

### Database Per Service Pattern

Each microservice has its own database for data isolation:

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  campusworks_auth   │  │ campusworks_tasks   │  │  campusworks_bids   │
│                     │  │                     │  │                     │
│ • users             │  │ • tasks             │  │ • bids              │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│campusworks_profile  │  │campusworks_payment  │
│                     │  │                     │
│ • profiles          │  │ • payments          │
│                     │  │ • escrows           │
│                     │  │ • transactions      │
│                     │  │ • wallets           │
│                     │  │ • razorpay_webhooks │
└─────────────────────┘  └─────────────────────┘
```

### Key Database Tables

#### Users Table (Auth Service)
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tasks Table (Task Service)
```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    owner_id BIGINT NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    assigned_user_id BIGINT,
    assigned_user_email VARCHAR(255),
    bidding_deadline DATETIME NOT NULL,
    completion_deadline DATETIME NOT NULL,
    completed_at DATETIME,
    accepted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Escrows Table (Payment Service) - 🔥 Custom Logic
```sql
CREATE TABLE escrows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL UNIQUE,
    payment_id BIGINT NOT NULL,
    client_user_id BIGINT NOT NULL,
    worker_user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    worker_amount DECIMAL(10,2) NOT NULL,
    status ENUM('CREATED', 'FUNDED', 'RELEASED', 'REFUNDED', 'DISPUTED') NOT NULL,
    expires_at TIMESTAMP NOT NULL, -- 🔥 TIED TO TASK DEADLINE
    released_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📚 API Reference by Business Function

### 🔐 Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/user/{email}` | Get user by email | No |

### 📝 Task Management APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tasks` | Create new task | Yes |
| GET | `/api/tasks` | Get all tasks | Yes |
| GET | `/api/tasks/{id}` | Get task by ID | Yes |
| PUT | `/api/tasks/{id}` | Update task | Yes (Owner) |
| DELETE | `/api/tasks/{id}` | Delete task | Yes (Owner) |
| GET | `/api/tasks/open-for-bidding` | Get biddable tasks | Yes |
| GET | `/api/tasks/user/{userId}` | Get user's tasks | Yes |
| GET | `/api/tasks/status/{status}` | Get tasks by status | Yes |
| GET | `/api/tasks/category/{category}` | Get tasks by category | Yes |
| PUT | `/api/tasks/{id}/status` | Update task status | Internal |

### 🏷️ Bidding APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bids` | Place new bid | Yes |
| GET | `/api/bids/task/{taskId}` | Get task bids | Yes |
| GET | `/api/bids/user/{userId}` | Get user's bids | Yes |
| GET | `/api/bids/status/{status}` | Get bids by status | Yes |
| PUT | `/api/bids/{id}` | Update bid | Yes (Owner) |
| DELETE | `/api/bids/{id}` | Delete bid | Yes (Owner) |
| GET | `/api/bids/user/{userId}/active` | Get active bids | Yes |
| POST | `/api/bids/{taskId}/auto-select` | Trigger auto-selection | Admin |

### 👤 Profile APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/profiles` | Create profile | Yes |
| GET | `/api/profiles` | Get public profiles | Yes |
| GET | `/api/profiles/{id}` | Get profile by ID | Yes |
| GET | `/api/profiles/user/{userId}` | Get user profile | Yes |
| GET | `/api/profiles/availability/{status}` | Get profiles by availability | Yes |
| PUT | `/api/profiles/user/{userId}` | Update profile | Yes (Owner) |
| PUT | `/api/profiles/user/{userId}/rating` | Add rating | Yes |
| PUT | `/api/profiles/user/{userId}/earnings` | Update earnings | Internal |

### 💰 Payment APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/tasks/{taskId}/create` | Create payment | Yes (Client) |
| POST | `/api/payments/tasks/{taskId}/accept` | Accept work | Yes (Client) |
| POST | `/api/payments/tasks/{taskId}/reject` | Reject work | Yes (Client) |
| GET | `/api/payments/tasks/{taskId}` | Get payment details | Yes |
| GET | `/api/payments/wallet` | Get user wallet | Yes |
| GET | `/api/payments/transactions` | Get transaction history | Yes |
| GET | `/api/payments/escrows/task/{taskId}` | Get escrow details | Yes |

### 🔔 Webhook & Admin APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/webhooks/razorpay` | Razorpay webhook | No (Signed) |
| GET | `/api/payments/webhooks/status` | Webhook status | Admin |
| POST | `/api/payments/admin/trigger-deadline-check` | Manual deadline check | Admin |
| GET | `/api/payments/admin/config` | Get scheduler config | Admin |

---

## 📊 Enumerations & Constants Reference

### 🏷️ Complete Enum Values for Frontend Development

This section provides all enumeration values that frontend developers need for dropdowns, filters, status displays, and validation.

#### Task-Related Enums

**Task Status (`TaskStatus`)**:
```javascript
const TASK_STATUS = {
  OPEN: 'OPEN',                    // Task is available for bidding
  IN_PROGRESS: 'IN_PROGRESS',      // Task assigned, work ongoing
  COMPLETED: 'COMPLETED',          // Work submitted by worker
  ACCEPTED: 'ACCEPTED',            // Work accepted by task owner
  CANCELLED: 'CANCELLED'           // Task cancelled
};
```

**Task Categories (`TaskCategory`)**:
```javascript
const TASK_CATEGORIES = {
  ACADEMIC_WRITING: 'ACADEMIC_WRITING',    // Essays, research papers
  PROGRAMMING: 'PROGRAMMING',              // Software development
  MATHEMATICS: 'MATHEMATICS',              // Math problems, statistics
  SCIENCE: 'SCIENCE',                      // Physics, chemistry, biology
  LITERATURE: 'LITERATURE',                // Literary analysis
  ENGINEERING: 'ENGINEERING',              // Technical calculations
  OTHER: 'OTHER'                          // Miscellaneous tasks
};
```

#### Bidding-Related Enums

**Bid Status (`BidStatus`)**:
```javascript
const BID_STATUS = {
  PENDING: 'PENDING',        // Bid is active, waiting for selection
  ACCEPTED: 'ACCEPTED',      // Bid won (selected by system/owner)
  REJECTED: 'REJECTED',      // Bid lost (not selected)
  WITHDRAWN: 'WITHDRAWN'     // Bid withdrawn by bidder
};
```

#### Profile-Related Enums

**Availability Status (`AvailabilityStatus`)**:
```javascript
const AVAILABILITY_STATUS = {
  AVAILABLE: 'AVAILABLE',      // User available for new tasks
  BUSY: 'BUSY',               // User currently working
  UNAVAILABLE: 'UNAVAILABLE', // User not available
  ON_BREAK: 'ON_BREAK'        // User temporarily on break
};
```

#### Payment-Related Enums

**Payment Status (`PaymentStatus`)**:
```javascript
const PAYMENT_STATUS = {
  CREATED: 'CREATED',         // Payment order created
  PENDING: 'PENDING',         // Waiting for user payment
  PROCESSING: 'PROCESSING',   // Payment being processed
  COMPLETED: 'COMPLETED',     // Payment successful
  FAILED: 'FAILED',          // Payment failed
  REFUNDED: 'REFUNDED'       // Payment refunded
};
```

**Escrow Status (`EscrowStatus`)**:
```javascript
const ESCROW_STATUS = {
  CREATED: 'CREATED',         // Escrow created, waiting for payment
  FUNDED: 'FUNDED',          // Payment received, money in escrow
  RELEASED: 'RELEASED',      // Money released to worker
  REFUNDED: 'REFUNDED',      // Money refunded to client
  DISPUTED: 'DISPUTED'       // Under dispute resolution
};
```

**Transaction Status (`TransactionStatus`)**:
```javascript
const TRANSACTION_STATUS = {
  PENDING: 'PENDING',         // Transaction processing
  COMPLETED: 'COMPLETED',     // Transaction successful
  FAILED: 'FAILED',          // Transaction failed
  CANCELLED: 'CANCELLED'     // Transaction cancelled
};
```

**Transaction Types (`TransactionType`)**:
```javascript
const TRANSACTION_TYPE = {
  ESCROW_FUNDED: 'ESCROW_FUNDED',           // Money deposited into escrow
  PAYMENT_RELEASED: 'PAYMENT_RELEASED',     // Payment released to worker
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',     // Payment refunded to client
  PLATFORM_FEE: 'PLATFORM_FEE',            // Platform fee deduction
  WALLET_DEPOSIT: 'WALLET_DEPOSIT',         // Money added to wallet
  WALLET_WITHDRAWAL: 'WALLET_WITHDRAWAL'    // Money withdrawn from wallet
};
```

**Wallet Status (`WalletStatus`)**:
```javascript
const WALLET_STATUS = {
  ACTIVE: 'ACTIVE',           // Wallet active and functional
  SUSPENDED: 'SUSPENDED',     // Wallet temporarily suspended
  CLOSED: 'CLOSED',          // Wallet permanently closed
  FROZEN: 'FROZEN'           // Wallet frozen due to issues
};
```

#### User Roles

**User Roles (`UserRole`)**:
```javascript
const USER_ROLES = {
  STUDENT: 'STUDENT',         // Regular user (can post tasks AND bid)
  ADMIN: 'ADMIN'             // Administrator user
};
```

### 🎨 Frontend Display Labels

**Status Display Labels**:
```javascript
const STATUS_LABELS = {
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
```

### 🎨 Status Colors for UI

**Status Color Mapping**:
```javascript
const STATUS_COLORS = {
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
```

### 📝 Validation Constants

**Field Validation Limits**:
```javascript
const VALIDATION_LIMITS = {
  TASK: {
    TITLE_MIN_LENGTH: 5,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 1000,
    MIN_BUDGET: 1.00,
    MAX_BUDGET: 10000.00
  },
  
  BID: {
    PROPOSAL_MIN_LENGTH: 10,
    PROPOSAL_MAX_LENGTH: 500,
    MIN_AMOUNT: 1.00,
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
```

### 🔗 API Endpoint Constants

**Base URLs and Endpoints**:
```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  
  ENDPOINTS: {
    // Authentication
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      USER: '/api/auth/user'
    },
    
    // Tasks
    TASKS: {
      BASE: '/api/tasks',
      BY_STATUS: '/api/tasks/status',
      BY_CATEGORY: '/api/tasks/category',
      OPEN_FOR_BIDDING: '/api/tasks/open-for-bidding',
      BY_USER: '/api/tasks/user'
    },
    
    // Bidding
    BIDS: {
      BASE: '/api/bids',
      BY_TASK: '/api/bids/task',
      BY_USER: '/api/bids/user',
      BY_STATUS: '/api/bids/status',
      AUTO_SELECT: '/api/bids/{taskId}/auto-select'
    },
    
    // Profiles
    PROFILES: {
      BASE: '/api/profiles',
      BY_USER: '/api/profiles/user',
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
```

---

## 🎨 Frontend Integration Guide

### Authentication Flow

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// 2. Store token
localStorage.setItem('authToken', token);

// 3. Use token in subsequent requests
const tasksResponse = await fetch('http://localhost:8080/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### State Management Requirements

**User State**:
```javascript
const userState = {
  isAuthenticated: boolean,
  user: {
    id: number,
    email: string,
    role: 'STUDENT' | 'ADMIN'
  },
  token: string,
  profile: UserProfile | null
};
```

**Task State**:
```javascript
const taskState = {
  tasks: Task[],
  currentTask: Task | null,
  filters: {
    status: TaskStatus,
    category: TaskCategory,
    budget: { min: number, max: number }
  },
  pagination: {
    page: number,
    size: number,
    total: number
  }
};
```

**Payment State**:
```javascript
const paymentState = {
  wallet: {
    balance: number,
    totalEarned: number,
    totalSpent: number
  },
  transactions: Transaction[],
  currentPayment: Payment | null,
  escrowStatus: EscrowStatus
};
```

### Real-time Updates Needed

**WebSocket Connections** (Future Enhancement):
- Bid notifications
- Payment confirmations  
- Task status updates
- Escrow deadline warnings

**Polling Requirements**:
- Task bidding countdown timers
- Payment processing status
- Escrow expiration warnings

### Date/Time Formatting

**ISO 8601 Format**: All dates in API responses
```javascript
// Example: "2024-01-15T10:30:00"
const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

**Currency Formatting**: 
```javascript
// All amounts in INR
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};
```

### Error Handling

**Standard Error Response Format**:
```javascript
{
  "error": "Error type",
  "message": "Detailed error message",
  "code": "ERROR_CODE", // Optional
  "timestamp": "2024-01-15T10:30:00"
}
```

**Frontend Error Handling**:
```javascript
const handleApiError = (error) => {
  switch (error.status) {
    case 401:
      // Redirect to login
      localStorage.removeItem('authToken');
      router.push('/login');
      break;
    case 403:
      // Show access denied
      showNotification('Access denied', 'error');
      break;
    case 400:
      // Show validation error
      showNotification(error.message, 'warning');
      break;
    default:
      // Show generic error
      showNotification('Something went wrong', 'error');
  }
};
```

---

## 🧪 Testing & Validation

### Postman Collection Structure

```
CampusWorks API Collection/
├── 🔐 Authentication/
│   ├── Register User
│   ├── Login User
│   └── Get User Info
├── 📝 Task Management/
│   ├── Create Task
│   ├── Get All Tasks
│   ├── Get Task by ID
│   ├── Update Task
│   └── Get Open Tasks
├── 🏷️ Bidding/
│   ├── Place Bid
│   ├── Get Task Bids
│   ├── Get User Bids
│   └── Auto-select Bids
├── 👤 Profiles/
│   ├── Create Profile
│   ├── Get Profile
│   ├── Update Profile
│   └── Add Rating
└── 💰 Payments/
    ├── Create Payment
    ├── Accept Work
    ├── Reject Work
    ├── Get Wallet
    └── Get Transactions
```

### Environment Variables

**Development**:
```json
{
  "baseUrl": "http://localhost:8080",
  "authToken": "{{jwt_token}}",
  "userId": "123",
  "userEmail": "test@example.com"
}
```

**Production**:
```json
{
  "baseUrl": "https://api.campusworks.com",
  "authToken": "{{jwt_token}}",
  "userId": "{{user_id}}",
  "userEmail": "{{user_email}}"
}
```

### Test Data Setup

**1. Create Test Users**:
```bash
# Register Client
curl -X POST http://localhost:8080/api/auth/register \
  -d '{"email":"client@test.com","password":"password123"}'

# Register Worker  
curl -X POST http://localhost:8080/api/auth/register \
  -d '{"email":"worker@test.com","password":"password123"}'
```

**2. Create Test Profiles**:
```bash
# Create profiles for both users
curl -X POST http://localhost:8080/api/profiles \
  -H "Authorization: Bearer <client-token>" \
  -d '{"firstName":"John","lastName":"Client","university":"Test University"}'
```

**3. Create Test Task**:
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <client-token>" \
  -d '{"title":"Test Task","description":"Test description","budget":100,"category":"COMPUTER_SCIENCE","completionDeadline":"2024-01-20T23:59:59"}'
```

### Mock Data Examples

**Mock Task Response**:
```json
{
  "id": 1,
  "title": "Build React Component",
  "description": "Create a reusable form component",
  "budget": 150.00,
  "category": "WEB_DEVELOPMENT",
  "status": "OPEN",
  "ownerId": 123,
  "ownerEmail": "client@example.com",
  "biddingDeadline": "2024-01-15T15:30:00",
  "completionDeadline": "2024-01-20T23:59:59",
  "createdAt": "2024-01-15T14:30:00"
}
```

**Mock Bid Response**:
```json
{
  "id": 10,
  "taskId": 1,
  "bidderId": 456,
  "bidderEmail": "worker@example.com",
  "amount": 120.00,
  "proposal": "I can build this component using React and TypeScript",
  "status": "PENDING",
  "isWinning": false,
  "createdAt": "2024-01-15T14:45:00"
}
```

---

## 🚀 Deployment Guide

### Service Startup Order

**Critical**: Services must be started in this order for proper dependency resolution:

```bash
# 1. Eureka Server (Service Discovery)
cd eureka-server && mvn spring-boot:run &

# Wait 30 seconds for Eureka to fully start

# 2. API Gateway (Routing & Auth)
cd api-gateway && mvn spring-boot:run &

# 3. Auth Service (User Management)
cd auth-service && mvn spring-boot:run &

# 4. Core Business Services (Can start in parallel)
cd task-service && mvn spring-boot:run &
cd bidding-service && mvn spring-boot:run &
cd profile-service && mvn spring-boot:run &

# 5. Payment Service (Depends on other services)
cd payment-service && mvn spring-boot:run &
```

### Database Setup

**1. Create All Databases**:
```bash
# Phase 1 (Auth)
mysql -u root -p < setup-database.sql

# Phase 2 (Task, Bidding, Profile)
mysql -u root -p < setup-phase2-databases.sql

# Payment Service
mysql -u root -p < setup-payment-database.sql
```

**2. Verify Database Creation**:
```sql
SHOW DATABASES LIKE 'campusworks_%';
-- Should show:
-- campusworks_auth
-- campusworks_tasks  
-- campusworks_bids
-- campusworks_profile
-- campusworks_payment
```

### Port Allocations

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Eureka Server** | 8761 | http://localhost:8761 | Service discovery dashboard |
| **API Gateway** | 8080 | http://localhost:8080 | Main entry point |
| **Auth Service** | 9000 | http://localhost:9000 | Direct access (dev only) |
| **Task Service** | 9001 | http://localhost:9001 | Direct access (dev only) |
| **Bidding Service** | 9002 | http://localhost:9002 | Direct access (dev only) |
| **Profile Service** | 9003 | http://localhost:9003 | Direct access (dev only) |
| **Payment Service** | 8084 | http://localhost:8084 | Direct access (dev only) |

### Environment-Specific Configurations

**Development** (`application-dev.properties`):
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/campusworks_auth
spring.datasource.username=root
spring.datasource.password=your_dev_password

# Logging
logging.level.com.campusworks=DEBUG
spring.jpa.show-sql=true

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

**Production** (`application-prod.properties`):
```properties
# Database
spring.datasource.url=jdbc:mysql://prod-db-host:3306/campusworks_auth
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Logging
logging.level.com.campusworks=INFO
spring.jpa.show-sql=false

# Eureka
eureka.client.service-url.defaultZone=http://eureka-prod:8761/eureka/
```

### Health Check Endpoints

**Service Health**:
```bash
# Check all services
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:9000/actuator/health  # Auth
curl http://localhost:9001/actuator/health  # Task
curl http://localhost:9002/actuator/health  # Bidding
curl http://localhost:9003/actuator/health  # Profile
curl http://localhost:8084/actuator/health  # Payment
```

**Eureka Dashboard**: http://localhost:8761
- Should show all 6 services registered
- All services should show "UP" status

---

## ❌ Error Handling

### Standardized Error Response Format

**All services return errors in this format**:
```json
{
  "error": "Error category",
  "message": "Detailed error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00",
  "path": "/api/endpoint",
  "status": 400
}
```

### Common Error Scenarios

#### Authentication Errors (401)

**Missing JWT Token**:
```json
{
  "error": "Authentication required",
  "message": "Authorization header missing or invalid",
  "code": "AUTH_TOKEN_MISSING"
}
```

**Expired JWT Token**:
```json
{
  "error": "Token expired",
  "message": "JWT token has expired, please login again",
  "code": "AUTH_TOKEN_EXPIRED"
}
```

#### Authorization Errors (403)

**Insufficient Permissions**:
```json
{
  "error": "Access denied",
  "message": "User does not have permission to access this resource",
  "code": "ACCESS_DENIED"
}
```

**Owner Bidding Restriction**:
```json
{
  "error": "Failed to place bid",
  "message": "Task owners cannot bid on their own tasks",
  "code": "OWNER_BIDDING_RESTRICTED"
}
```

#### Validation Errors (400)

**Invalid Request Data**:
```json
{
  "error": "Validation failed",
  "message": "Budget must be between ₹1.00 and ₹10,000.00",
  "code": "INVALID_BUDGET_RANGE"
}
```

**Business Logic Violation**:
```json
{
  "error": "Invalid operation",
  "message": "Cannot bid on task after bidding deadline has passed",
  "code": "BIDDING_DEADLINE_EXPIRED"
}
```

#### Service Unavailable Errors (503)

**Circuit Breaker Open**:
```json
{
  "error": "Service temporarily unavailable",
  "message": "Task Service is currently unavailable, please try again later",
  "code": "SERVICE_CIRCUIT_BREAKER_OPEN"
}
```

**Database Connection Error**:
```json
{
  "error": "Database connection failed",
  "message": "Unable to connect to database, please try again",
  "code": "DATABASE_CONNECTION_ERROR"
}
```

### Error Code Reference

| Code | Description | HTTP Status | Action |
|------|-------------|-------------|---------|
| `AUTH_TOKEN_MISSING` | No JWT token provided | 401 | Redirect to login |
| `AUTH_TOKEN_EXPIRED` | JWT token expired | 401 | Refresh token or login |
| `ACCESS_DENIED` | Insufficient permissions | 403 | Show error message |
| `OWNER_BIDDING_RESTRICTED` | Owner cannot bid | 400 | Show restriction notice |
| `BIDDING_DEADLINE_EXPIRED` | Bidding period ended | 400 | Refresh task list |
| `INSUFFICIENT_BALANCE` | Not enough wallet balance | 400 | Add funds prompt |
| `TASK_NOT_FOUND` | Task doesn't exist | 404 | Redirect to task list |
| `ESCROW_ALREADY_RELEASED` | Payment already processed | 400 | Refresh status |
| `SERVICE_CIRCUIT_BREAKER_OPEN` | Service unavailable | 503 | Retry later |

---

## 🔒 Security Considerations

### JWT Security

**Token Storage**:
- **Frontend**: Store in `localStorage` or secure HTTP-only cookies
- **Expiration**: 24 hours (86400000 ms)
- **Refresh**: Implement token refresh mechanism

**Token Validation**:
- All protected endpoints validate JWT at API Gateway
- User context propagated via headers to downstream services
- No JWT processing in individual microservices

### CORS Configuration

**API Gateway CORS Settings**:
```properties
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-origin-patterns=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-headers=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allow-credentials=true
```

**Production CORS** (Recommended):
```properties
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-origins=https://campusworks.com,https://www.campusworks.com
```

### Input Validation & Sanitization

**Request Validation**:
- All input validated using Bean Validation annotations
- SQL injection prevention through JPA parameterized queries
- XSS prevention through input sanitization

**Example Validation**:
```java
@PostMapping("/tasks")
public ResponseEntity<?> createTask(@Valid @RequestBody CreateTaskRequest request) {
    // Validation automatically applied
}

public class CreateTaskRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;
    
    @NotNull(message = "Budget is required")
    @DecimalMin(value = "1.0", message = "Budget must be at least ₹1.00")
    @DecimalMax(value = "10000.0", message = "Budget must not exceed ₹10,000.00")
    private BigDecimal budget;
}
```

### Sensitive Data Handling

**Password Security**:
- BCrypt encryption with salt
- Minimum 8 characters required
- Passwords never returned in API responses

**Payment Security**:
- Razorpay webhook signature verification
- PCI DSS compliance through Razorpay
- No card details stored in application database
- All financial transactions logged for audit

**Database Security**:
- Connection credentials in environment variables
- Database connections use SSL in production
- Regular database backups with encryption

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 1. Service Registration Issues

**Problem**: Services not appearing in Eureka dashboard

**Symptoms**:
```bash
curl http://localhost:8761
# Shows empty or incomplete service list
```

**Solutions**:
1. **Check Eureka Server**: Ensure running on port 8761
2. **Verify Configuration**:
   ```properties
   eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
   ```
3. **Check Network**: Ensure no firewall blocking ports
4. **Restart Order**: Start Eureka first, wait 30 seconds, then other services

#### 2. JWT Authentication Failures

**Problem**: Getting 401 Unauthorized errors

**Symptoms**:
```json
{
  "error": "Authentication required",
  "message": "Authorization header missing or invalid"
}
```

**Solutions**:
1. **Check Token Format**:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. **Verify Token Expiry**: Tokens expire after 24 hours
3. **Check JWT Secret**: Must match between Auth Service and API Gateway
4. **Login Again**: Get fresh token from `/api/auth/login`

#### 3. Database Connection Issues

**Problem**: Service fails to start with database errors

**Symptoms**:
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**Solutions**:
1. **Check MySQL Status**:
   ```bash
   sudo systemctl status mysql
   ```
2. **Verify Database Exists**:
   ```sql
   SHOW DATABASES LIKE 'campusworks_%';
   ```
3. **Check Credentials**:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```
4. **Run Setup Scripts**:
   ```bash
   mysql -u root -p < setup-database.sql
   ```

#### 4. Feign Client Failures

**Problem**: Inter-service communication failing

**Symptoms**:
```json
{
  "error": "Service temporarily unavailable",
  "message": "Task Service is currently unavailable"
}
```

**Solutions**:
1. **Check Service Status**: Verify target service is running
2. **Check Eureka Registration**: Service must be registered
3. **Verify Headers**: Ensure auth headers are propagated
4. **Check Circuit Breaker**: May be open due to previous failures
5. **Review Fallback**: Check fallback implementation

#### 5. Payment Integration Issues

**Problem**: Razorpay payments failing

**Symptoms**:
```json
{
  "error": "Payment creation failed",
  "message": "Invalid API key provided"
}
```

**Solutions**:
1. **Check Razorpay Keys**:
   ```properties
   payment.razorpay.key-id=rzp_test_your_key_id
   payment.razorpay.key-secret=your_secret_key
   ```
2. **Verify Test Mode**: Use test keys for development
3. **Check Webhook URL**: Must be accessible from internet
4. **Validate Signature**: Webhook signature verification must pass

#### 6. Automatic Bid Selection Not Working

**Problem**: Bids not being selected automatically

**Symptoms**: Tasks remain in BIDDING_OPEN status past deadline

**Solutions**:
1. **Check Scheduler**: Verify `@EnableScheduling` annotation
2. **Check Time Configuration**:
   ```properties
   task.bidding-period-hours=1
   ```
3. **Manual Trigger**: Use admin endpoint to test
   ```bash
   curl -X POST http://localhost:8080/api/bids/{taskId}/auto-select
   ```
4. **Check Logs**: Look for scheduler execution logs

### Debugging Tools

#### Enable Debug Logging

```properties
# Application-specific logging
logging.level.com.campusworks=DEBUG

# Spring Cloud Gateway
logging.level.org.springframework.cloud.gateway=DEBUG

# Feign Client
logging.level.feign=DEBUG

# JPA/Hibernate
logging.level.org.hibernate.SQL=DEBUG
```

#### Health Check Script

```bash
#!/bin/bash
echo "🔍 CampusWorks Health Check"

services=(
  "eureka:8761"
  "gateway:8080" 
  "auth:9000"
  "task:9001"
  "bidding:9002"
  "profile:9003"
  "payment:8084"
)

for service in "${services[@]}"; do
  name="${service%:*}"
  port="${service#*:}"
  
  if curl -s http://localhost:$port/actuator/health > /dev/null; then
    echo "✅ $name service (port $port) - UP"
  else
    echo "❌ $name service (port $port) - DOWN"
  fi
done
```

#### Database Verification Script

```sql
-- Check all CampusWorks databases
SELECT 
    SCHEMA_NAME as 'Database',
    DEFAULT_CHARACTER_SET_NAME as 'Charset',
    DEFAULT_COLLATION_NAME as 'Collation'
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME LIKE 'campusworks_%';

-- Check table counts
SELECT 
    'campusworks_auth' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'campusworks_auth') as table_count
UNION ALL
SELECT 
    'campusworks_tasks' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'campusworks_tasks') as table_count
UNION ALL
SELECT 
    'campusworks_bids' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'campusworks_bids') as table_count
UNION ALL
SELECT 
    'campusworks_profile' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'campusworks_profile') as table_count
UNION ALL
SELECT 
    'campusworks_payment' as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'campusworks_payment') as table_count;
```

---

## 📝 Configuration Templates

### application.properties Template

```properties
# =========================
# Server Configuration
# =========================
server.port=${SERVICE_PORT:9000}

# =========================
# Spring Application
# =========================
spring.application.name=${SERVICE_NAME:service-name}
spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}

# =========================
# Database Configuration
# =========================
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:campusworks_service}?createDatabaseIfNotExist=true&useSSL=${DB_SSL:false}&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:password}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# =========================
# JPA/Hibernate Configuration
# =========================
spring.jpa.hibernate.ddl-auto=${JPA_DDL_AUTO:update}
spring.jpa.show-sql=${JPA_SHOW_SQL:true}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=${JPA_FORMAT_SQL:true}

# =========================
# Eureka Client
# =========================
eureka.client.service-url.defaultZone=${EUREKA_URL:http://localhost:8761/eureka/}
eureka.instance.hostname=${EUREKA_HOSTNAME:localhost}
eureka.instance.prefer-ip-address=${EUREKA_PREFER_IP:false}
eureka.instance.instance-id=${spring.application.name}:${server.port}
eureka.instance.ip-address=${EUREKA_IP:127.0.0.1}
eureka.client.healthcheck.enabled=true

# =========================
# Actuator Configuration
# =========================
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always

# =========================
# Logging Configuration
# =========================
logging.level.com.campusworks=${LOG_LEVEL:DEBUG}
logging.level.org.springframework.web=${SPRING_LOG_LEVEL:INFO}
```

### Docker Compose Template

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: campusworks_auth
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./setup-database.sql:/docker-entrypoint-initdb.d/01-setup.sql
      - ./setup-phase2-databases.sql:/docker-entrypoint-initdb.d/02-phase2.sql
      - ./setup-payment-database.sql:/docker-entrypoint-initdb.d/03-payment.sql

  eureka-server:
    build: ./eureka-server
    ports:
      - "8761:8761"
    environment:
      SPRING_PROFILES_ACTIVE: docker

  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server
    environment:
      EUREKA_URL: http://eureka-server:8761/eureka/
      SPRING_PROFILES_ACTIVE: docker

  auth-service:
    build: ./auth-service
    ports:
      - "9000:9000"
    depends_on:
      - mysql
      - eureka-server
    environment:
      DB_HOST: mysql
      EUREKA_URL: http://eureka-server:8761/eureka/
      SPRING_PROFILES_ACTIVE: docker

  task-service:
    build: ./task-service
    ports:
      - "9001:9001"
    depends_on:
      - mysql
      - eureka-server
    environment:
      DB_HOST: mysql
      DB_NAME: campusworks_tasks
      EUREKA_URL: http://eureka-server:8761/eureka/
      SPRING_PROFILES_ACTIVE: docker

  bidding-service:
    build: ./bidding-service
    ports:
      - "9002:9002"
    depends_on:
      - mysql
      - eureka-server
    environment:
      DB_HOST: mysql
      DB_NAME: campusworks_bids
      EUREKA_URL: http://eureka-server:8761/eureka/
      SPRING_PROFILES_ACTIVE: docker

  profile-service:
    build: ./profile-service
    ports:
      - "9003:9003"
    depends_on:
      - mysql
      - eureka-server
    environment:
      DB_HOST: mysql
      DB_NAME: campusworks_profile
      EUREKA_URL: http://eureka-server:8761/eureka/
      SPRING_PROFILES_ACTIVE: docker

  payment-service:
    build: ./payment-service
    ports:
      - "8084:8084"
    depends_on:
      - mysql
      - eureka-server
    environment:
      DB_HOST: mysql
      DB_NAME: campusworks_payment
      EUREKA_URL: http://eureka-server:8761/eureka/
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
      SPRING_PROFILES_ACTIVE: docker

volumes:
  mysql_data:
```

### Environment Variables Template

**.env file**:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secure_secret_key_that_is_more_than_32_characters
JWT_EXPIRATION=86400000

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Service Configuration
EUREKA_URL=http://localhost:8761/eureka/
SPRING_PROFILES_ACTIVE=dev

# Logging Configuration
LOG_LEVEL=DEBUG
SPRING_LOG_LEVEL=INFO
```

---

## 📊 Performance Monitoring

### Key Metrics to Monitor

**Service Health Metrics**:
- Response time per endpoint
- Request throughput (requests/second)
- Error rate percentage
- Circuit breaker status

**Business Metrics**:
- Task creation rate
- Bid placement rate  
- Payment success rate
- Automatic bid selection success rate

**Database Metrics**:
- Connection pool utilization
- Query execution time
- Database connection errors
- Table row counts

### Monitoring Endpoints

**Actuator Endpoints**:
```bash
# Health status
GET /actuator/health

# Application metrics
GET /actuator/metrics

# Environment info
GET /actuator/info

# HTTP trace (last 100 requests)
GET /actuator/httptrace
```

---

## 🎯 Future Enhancements

### Planned Features

1. **Real-time Notifications**
   - WebSocket integration for live updates
   - Email notifications for important events
   - Push notifications for mobile app

2. **Advanced Search & Filtering**
   - Elasticsearch integration
   - Full-text search across tasks
   - Advanced filtering by skills, location, etc.

3. **File Upload Support**
   - Task attachments (requirements, examples)
   - Work submission files
   - Profile portfolio uploads

4. **Chat System**
   - Real-time messaging between task owners and bidders
   - File sharing in chat
   - Chat history and archival

5. **Analytics Dashboard**
   - User performance analytics
   - Platform usage statistics
   - Revenue and transaction reports

6. **Mobile API Optimization**
   - Optimized endpoints for mobile
   - Push notification support
   - Offline capability

### Technical Improvements

1. **Caching Layer**
   - Redis for session management
   - Cache frequently accessed data
   - Improve response times

2. **Message Queue**
   - RabbitMQ for async processing
   - Event-driven architecture
   - Improved scalability

3. **API Versioning**
   - Support multiple API versions
   - Backward compatibility
   - Gradual migration strategy

4. **Enhanced Security**
   - OAuth2 integration
   - Two-factor authentication
   - Rate limiting

---

**🎉 This completes the comprehensive CampusWorks Backend Documentation. The system is production-ready with all microservices, APIs, business logic, and integration details fully documented for frontend development and deployment.**

---

> **Documentation Version**: 3.0.0  
> **Last Updated**: January 2025  
> **Total API Endpoints**: 45+  
> **Microservices**: 7  
> **Database Tables**: 12  
> **Business Workflows**: 3 core flows implemented  

**For questions or clarifications, refer to the troubleshooting guide or contact the development team.**
