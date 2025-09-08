# CampusWorks - Complete Project Blueprint
## Peer-to-Peer Academic Record Outsourcing Platform

---

## 🎯 Project Overview

**CampusWorks** is a platform where students can post offline record/assignment tasks they need help with, along with a budget. Other students can view these tasks, place bids within a limited time window, and the lowest bidder gets assigned. The assigned student completes the work offline, notifies completion, the task owner verifies offline and accepts online, then payment is processed.

**🎯 KEY POINT: Single Role System**
- **All users are STUDENTs by default** (except one admin)
- **Same person can both post tasks AND bid on tasks**
- **No complex role management needed**
- **Simpler, more flexible, and more realistic**

### Core Workflow:
1. **Student posts task** with budget and requirements
2. **Other students bid** on tasks within time window
3. **Lowest bidder wins** and gets assigned
4. **Assigned student completes work** offline and notifies completion
5. **Task owner verifies work** offline and accepts online
6. **Payment processed** through escrow system
7. **Chat communication** for task clarification

**💡 Note**: The same person can be both a task poster AND a task bidder - they're all students!

---

## 🏗️ System Architecture

### Microservices Architecture with API Gateway Pattern
- **Eureka Server** - Service Discovery & Registration
- **API Gateway** - Centralized routing, JWT validation, CORS
- **Auth Service** - User authentication, authorization, role management
- **Task Service** - Task CRUD operations, status management
- **Bidding Service** - Bid management, auction logic
- **Payment Service** - Escrow system, payment processing
- **Notification Service** - Real-time notifications, messaging
- **Profile Service** - User profile management
- **Chat Service** - Real-time communication between users

---

## 🔐 Security & Authentication Strategy

### JWT-Based Security via API Gateway
- **Single JWT validation** at API Gateway level
- **No JWT handling** in downstream services
- **Role-based access control** using Spring Security
- **CORS configured globally** at API Gateway only

### Role Management (Simplified & Secure) - APPROACH A RECOMMENDED ✅

**Why This Approach?**
- **Simpler**: No complex role promotion system needed
- **Flexible**: Same person can both post tasks AND bid on tasks
- **Secure**: Only one admin, no self-promotion to admin
- **Realistic**: Matches how students actually work in real life

**How It Works:**
- **Only ONE ADMIN** - created automatically on startup
- **All new registrations default to STUDENT**
- **STUDENT role is flexible** - same person can:
  - Post tasks (as a student needing help)
  - Bid on others' tasks (as a student helping others)
- **No complex role management needed**
- **Business logic determines context**:
  - If posting task → acting as STUDENT needing help
  - If bidding on task → acting as STUDENT helping others
  - But still same role: STUDENT

**Example User Journey:**
1. **John registers** → Gets STUDENT role
2. **John posts a task** → "I need help with math assignment"
3. **John bids on Mary's task** → "I can help with English essay"
4. **John can do both** → Same role, different contexts

---

## 📋 Detailed Service Breakdown

### 1. **Eureka Server** (Port: 8761)
**Purpose**: Service discovery and registration hub
**Technology**: Spring Cloud Netflix Eureka
**Responsibilities**:
- Register all microservices
- Provide service lookup
- Health monitoring
- Load balancing support

**Key Features**:
- Self-preservation disabled for development
- Fast instance eviction
- Health check endpoints

---

### 2. **API Gateway** (Port: 8080)
**Purpose**: Centralized entry point, JWT validation, routing
**Technology**: Spring Cloud Gateway
**Responsibilities**:
- Route requests to appropriate services
- Validate JWT tokens
- Extract user context (ID, email, roles)
- Propagate user info to downstream services
- Global CORS configuration
- Rate limiting (future enhancement)

**JWT Flow**:
1. Extract JWT from Authorization header
2. Validate token signature and expiration
3. Extract user claims (ID, email, roles)
4. Add headers: `X-User-Id`, `X-User-Email`, `X-User-Roles`
5. Forward request to appropriate service

**Public Endpoints** (No JWT required):
- `/auth/**` - Direct authentication endpoints
- `/api/auth/**` - API-style authentication endpoints  
- `/actuator/**` - Health checks

**Note**: Both `/auth/**` and `/api/auth/**` paths work for flexibility

**Protected Endpoints** (JWT required):
- All other endpoints require valid JWT

---

### 3. **Auth Service** (Port: 9001)
**Purpose**: User authentication, registration, role management
**Technology**: Spring Boot, Spring Security, MySQL
**Responsibilities**:
- User registration and login
- JWT token generation
- Password encryption
- Role validation
- Default admin creation

**Database**: `campusworks_auth`
**Key Endpoints**:
- `POST /auth/register` - User registration (defaults to STUDENT)
- `POST /auth/login` - User authentication
- `GET /auth/health` - Service health check

**Security Features**:
- BCrypt password encoding
- JWT token generation with user context
- Role validation during registration
- CSRF disabled for API usage

**Default Admin Creation**:
- Automatically creates admin user on startup
- Email: `admin@campusworks.com`
- Password: `admin123`
- Role: `ADMIN`

---

### 4. **Task Service** (Port: 9002)
**Purpose**: Task management, status tracking
**Technology**: Spring Boot, Spring Security, MySQL
**Responsibilities**:
- Create, read, update, delete tasks
- Task status management (OPEN, ASSIGNED, COMPLETED)
- Task assignment logic
- Task ownership validation

**Database**: `campusworks_tasks`
**Key Endpoints**:
- `GET /tasks` - List all tasks (all authenticated users)
- `POST /tasks` - Create new task (STUDENT only)
- `GET /tasks/{id}` - Get task details (all authenticated users)
- `PUT /tasks/{id}` - Update task (owner or ADMIN)
- `DELETE /tasks/{id}` - Delete task (owner or ADMIN)
- `GET /tasks/my-tasks` - Get user's own tasks (STUDENT)
- `PUT /tasks/{id}/status` - Update task status (owner only)

**Business Logic**:
- Only STUDENTs can create tasks
- Task owners can update/delete their tasks
- ADMINs have full access to all tasks
- Status transitions: OPEN → ASSIGNED → COMPLETED

---

### 5. **Bidding Service** (Port: 9003)
**Purpose**: Bid management, auction logic, winner determination
**Technology**: Spring Boot, Spring Security, MySQL
**Responsibilities**:
- Accept bids on tasks
- Track bid history
- Determine lowest bidder
- Assign tasks to winners

**Database**: `campusworks_bids`
**Key Endpoints**:
- `GET /bids` - List all bids (ADMIN only)
- `GET /bids/task/{taskId}` - Get bids for specific task (all authenticated users)
- `POST /bids` - Place new bid (STUDENT role)
- `GET /bids/my-bids` - Get user's own bids (STUDENT)
- `DELETE /bids/{id}` - Delete bid (owner or ADMIN)

**Business Logic**:
- **STUDENTs can place bids** on others' tasks (acting as workers)
- Bids are tracked per task
- Lowest bid wins (auction logic)
- Task assignment happens when bidding period ends
- **Context**: When bidding, user is acting as a STUDENT helping others

---

### 6. **Payment Service** (Port: 9004)
**Purpose**: Escrow system, payment processing
**Technology**: Spring Boot, Spring Security, MySQL
**Responsibilities**:
- Hold payments in escrow
- Release payments upon task completion
- Handle refunds if needed
- Payment status tracking

**Database**: `campusworks_payment`
**Key Endpoints**:
- `GET /escrows` - List all escrow transactions (ADMIN only)
- `POST /escrows` - Create escrow (hold payment)
- `POST /escrows/{id}/release` - Release payment to worker
- `POST /escrows/{id}/refund` - Refund payment to student

**Business Logic**:
- Payment held in escrow when task assigned
- Released to task bidder when task completed and accepted
- Refunded to task owner if task rejected
- Status tracking: HELD → RELEASED/REFUNDED

---

### 7. **Notification Service** (Port: 9005)
**Purpose**: Real-time notifications, messaging
**Technology**: Spring Boot, MongoDB
**Responsibilities**:
- Send notifications for task updates
- Handle real-time messaging
- Notification delivery tracking
- User notification preferences

**Database**: `campusworks_notifications` (MongoDB)
**Key Endpoints**:
- `GET /notifications` - List all notifications (ADMIN only)
- `GET /notifications/user/{userId}` - Get user's notifications
- `POST /notifications` - Create new notification
- `POST /notifications/{id}/deliver` - Mark notification as delivered

**Business Logic**:
- Notifications for task assignment, completion, payment
- Real-time delivery via WebSocket (future enhancement)
- Delivery status tracking

---

### 8. **Profile Service** (Port: 9006)
**Purpose**: User profile management
**Technology**: Spring Boot, Spring Security, MySQL
**Responsibilities**:
- Store user profile information
- Profile CRUD operations
- Profile validation
- User preferences

**Database**: `campusworks_profile`
**Key Endpoints**:
- `GET /profiles` - List all profiles (all authenticated users)
- `GET /profiles/{id}` - Get profile details (all authenticated users)
- `POST /profiles` - Create new profile (all authenticated users)
- `PUT /profiles/{id}` - Update profile (owner or ADMIN)
- `DELETE /profiles/{id}` - Delete profile (owner or ADMIN)

**Business Logic**:
- All authenticated users can create profiles
- Users can update their own profiles
- ADMINs have full access to all profiles

---

### 9. **Chat Service** (Port: 9007) - Future Enhancement
**Purpose**: Real-time communication between users
**Technology**: Spring Boot, WebSocket, Redis
**Responsibilities**:
- Real-time messaging
- Chat room management
- Message history
- File sharing

**Database**: `campusworks_chat` (MongoDB)
**Key Features**:
- WebSocket-based real-time communication
- Chat rooms per task
- Message persistence
- File upload support

---

## 🗄️ Database Design

### MySQL Databases (One per service)
1. **campusworks_auth** - Users, roles, authentication
2. **campusworks_tasks** - Task information, status
3. **campusworks_bids** - Bidding data, auction history
4. **campusworks_payment** - Escrow transactions, payments
5. **campusworks_profile** - User profiles, preferences

### MongoDB Collections
1. **campusworks_notifications** - Notifications, messages
2. **campusworks_chat** - Chat messages, conversations (future)

---

## 🔧 Technical Requirements

### Spring Boot Version
- **All services**: Spring Boot 3.4.0
- **Spring Cloud**: 2024.0.1
- **Java**: 17

### Dependencies
- **Spring Boot Starter Web** (where applicable)
- **Spring Boot Starter Security** (where applicable)
- **Spring Boot Starter Data JPA** (MySQL services)
- **Spring Boot Starter Data MongoDB** (MongoDB services)
- **Spring Cloud Starter Gateway** (API Gateway)
- **Spring Cloud Starter Netflix Eureka Server/Client**
- **JJWT 0.12.3** (JWT handling)
- **MySQL Connector** (MySQL services)
- **MongoDB Driver** (MongoDB services)
- **Lombok** (boilerplate reduction)
- **Spring Boot Starter Actuator** (health checks)

### Configuration Files
- **All services**: `.properties` files only (no `.yml`)
- **Consistent naming**: `application.properties`
- **Environment-specific**: Separate configs for dev/prod

---

## 🚀 Implementation Strategy

### Phase 1: Core Infrastructure
1. **Eureka Server** - Service discovery foundation
2. **API Gateway** - Centralized routing and security
3. **Auth Service** - User management foundation
4. **Basic configuration** - Properties files, dependencies

### Phase 2: Core Business Logic
1. **Task Service** - Task management
2. **Bidding Service** - Auction system
3. **Payment Service** - Escrow system
4. **Integration testing** - Service communication

### Phase 3: Enhanced Features
1. **Profile Service** - User profiles
2. **Notification Service** - Messaging system
3. **Advanced security** - Role-based access control
4. **Performance optimization** - Caching, load balancing

### Phase 4: Advanced Features
1. **Chat Service** - Real-time communication
2. **File upload** - Document sharing
3. **Advanced analytics** - Reporting, metrics
4. **Production deployment** - Docker, Kubernetes

---

## 📝 Logging Strategy

### Consistent Logging Across All Services
- **Log Level**: DEBUG for development, INFO for production
- **Structured Logging**: Consistent format across services
- **Request Tracking**: Unique request IDs for tracing
- **Error Logging**: Detailed error information with stack traces
- **Performance Logging**: Request/response time tracking

### Log Format
```
[Timestamp] [Service] [Level] [RequestId] [User] [Message] [Context]
```

### Log Categories
- **Authentication**: Login, logout, registration attempts
- **Business Logic**: Task creation, bidding, payment processing
- **Security**: Authorization failures, validation errors
- **Performance**: Slow queries, timeouts
- **Integration**: Service-to-service communication

---

## 🔒 Security Implementation

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roles": "STUDENT",
  "iat": "issued_at_timestamp",
  "exp": "expiration_timestamp"
}
```

### Role-Based Access Control (Simplified)
- **@PreAuthorize("hasRole('ADMIN')")** - Admin-only endpoints
- **@PreAuthorize("hasRole('STUDENT')")** - Student-only endpoints (can do everything)
- **@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")** - Student and Admin access
- **No WORKER role needed** - STUDENTs can naturally act as workers

### Security Headers Propagation
API Gateway adds these headers to downstream services:
- `X-User-Id`: User's unique identifier
- `X-User-Email`: User's email address
- `X-User-Roles`: User's role(s)

**Why These Headers?**
- **Downstream services don't need to parse JWT again**
- **User context is automatically available**
- **Services can use `@RequestHeader("X-User-Id")` to get user info**
- **No need to re-validate JWT in each service**
- **Consistent user context across all microservices**

**How to Use in Postman:**
- **Only need to set**: `Authorization: Bearer <your-jwt-token>`
- **API Gateway automatically adds**: `X-User-Id`, `X-User-Email`, `X-User-Roles`
- **You don't manually set these headers** - they're added automatically

**How to Use in Code:**
```java
@GetMapping("/my-tasks")
public List<Task> getMyTasks(@RequestHeader("X-User-Id") Long userId) {
    // userId is automatically extracted from JWT by API Gateway
    return taskService.findByOwnerId(userId);
}
```

---

## 🌐 CORS Configuration

### Global CORS at API Gateway
- **Allowed Origin Patterns**: All origins (`*`) for development
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: All headers (`*`)
- **Credentials**: Enabled for authentication
- **Max Age**: 1 hour cache for preflight requests

**Note**: Uses `allowed-origin-patterns` instead of `allowed-origins` for compatibility with credentials

### No CORS Configuration in Individual Services
- CORS handled centrally at API Gateway
- Downstream services focus on business logic
- Consistent CORS behavior across all endpoints

---

## 📊 Health Monitoring

### Actuator Endpoints
- **Health Checks**: `/actuator/health`
- **Info**: `/actuator/info`
- **Metrics**: `/actuator/metrics` (future)
- **Custom Health**: Service-specific health indicators

### Health Check Strategy
- **Database connectivity** - Verify database connections
- **Service dependencies** - Check inter-service communication
- **Resource availability** - Memory, disk space monitoring
- **Custom business logic** - Service-specific health criteria

---

## 🧪 Testing Strategy

### Unit Testing
- **Service layer** - Business logic validation
- **Repository layer** - Data access testing
- **Controller layer** - API endpoint testing
- **Security layer** - Authentication/authorization testing

### Integration Testing
- **Service-to-service** - Inter-service communication
- **Database integration** - Data persistence testing
- **API Gateway** - Routing and security validation
- **End-to-end** - Complete workflow testing

### Test Data
- **Sample users** - Different roles and scenarios
- **Sample tasks** - Various task types and statuses
- **Sample bids** - Different bidding scenarios
- **Sample payments** - Various payment states

---

## 🚀 Deployment Strategy

### Development Environment
- **Local development** - All services on localhost
- **Docker containers** - Individual service containers
- **Database setup** - Local MySQL and MongoDB instances
- **Service discovery** - Local Eureka server

### Production Environment
- **Container orchestration** - Kubernetes deployment
- **Load balancing** - Multiple service instances
- **Database clustering** - High availability databases
- **Monitoring** - Prometheus, Grafana, ELK stack

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Create project structure
- [ ] Set up Eureka Server
- [ ] Configure API Gateway
- [ ] Implement Auth Service
- [ ] Basic JWT security
- [ ] Service discovery working

### Phase 2: Core Services
- [ ] Task Service implementation
- [ ] Bidding Service implementation
- [ ] Payment Service implementation
- [ ] Service integration testing
- [ ] Basic workflow testing

### Phase 3: Enhancement
- [ ] Profile Service
- [ ] Notification Service
- [ ] Advanced security
- [ ] Performance optimization
- [ ] Comprehensive testing

### Phase 4: Production Ready
- [ ] Chat Service
- [ ] File upload
- [ ] Advanced analytics
- [ ] Production deployment
- [ ] Monitoring and alerting

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] User registration and login working
- [ ] Task creation and management functional
- [ ] Bidding system operational
- [ ] Payment processing working
- [ ] Real-time notifications functional
- [ ] Role-based access control enforced

### Non-Functional Requirements
- [ ] Response time < 500ms for 95% of requests
- [ ] 99.9% uptime availability
- [ ] Secure JWT implementation
- [ ] Comprehensive logging
- [ ] Scalable microservices architecture
- [ ] CORS properly configured

---

## 🔮 Future Enhancements

### Advanced Features
- **Real-time chat** - WebSocket-based communication
- **File sharing** - Document upload and management
- **Advanced analytics** - User behavior, task statistics
- **Mobile app** - React Native or Flutter
- **AI integration** - Task matching, fraud detection

### Scalability Features
- **Load balancing** - Multiple service instances
- **Caching** - Redis for performance
- **Message queues** - RabbitMQ for async processing
- **Database sharding** - Horizontal scaling
- **CDN integration** - Static content delivery

---

## 📚 Reference Documentation

### Spring Boot & Cloud
- Spring Boot 3.4.0 Reference Guide
- Spring Cloud 2024.0.1 Documentation
- Spring Security Reference

### JWT & Security
- JJWT 0.12.3 Documentation
- JWT.io for token debugging
- OAuth 2.0 and JWT best practices

### Database
- MySQL 8.0 Reference Manual
- MongoDB Documentation
- JPA/Hibernate Best Practices

---

## 🔧 **Recent Implementation Fixes**

### **1. CORS Configuration Issue Resolved**
- **Problem**: CORS error when `allowCredentials=true` with `allowed-origins=*`
- **Solution**: Changed to `allowed-origin-patterns=*` for compatibility
- **Result**: Both CORS and credentials now work properly

### **2. Gateway Route Enhancement**
- **Problem**: Only `/api/auth/**` routes were working initially
- **Solution**: Added direct `/auth/**` route for flexibility
- **Result**: Both `/auth/**` and `/api/auth/**` paths now work

### **3. Updated Gateway Configuration**
```properties
# Both routes available for flexibility:
spring.cloud.gateway.routes[0].id=auth-service-api
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/auth/**

spring.cloud.gateway.routes[1].id=auth-service-direct  
spring.cloud.gateway.routes[1].predicates[0]=Path=/auth/**

# Fixed CORS configuration:
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-origin-patterns=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allow-credentials=true
```

---

## 🎯 Final Implementation Summary

### What We're Building
**CampusWorks** - A peer-to-peer academic task outsourcing platform where:
- **All users are STUDENTs by default** (except one admin)
- **Same person can both post tasks AND bid on tasks**
- **No complex role management needed**
- **JWT security handled only at API Gateway**
- **Microservices architecture for scalability**

### Key Benefits of This Approach
✅ **Simpler**: No complex role promotion system  
✅ **Flexible**: Users can naturally switch between task poster and task bidder  
✅ **Secure**: Only one admin, no self-promotion to admin  
✅ **Realistic**: Matches how students actually work in real life  
✅ **Maintainable**: Clean separation of concerns  

### What You Need to Remember
1. **Only set `Authorization: Bearer <jwt>` in Postman** - other headers are automatic
2. **All new users get STUDENT role by default**
3. **STUDENTs can do everything** - post tasks, bid on tasks, etc.
4. **API Gateway handles all JWT validation** - services just use the headers
5. **No WORKER role needed** - it's all handled by business logic

---

This blueprint provides a comprehensive roadmap for implementing CampusWorks from scratch. Each service has clear responsibilities, the security model is well-defined, and the implementation phases are structured for incremental development. The focus on microservices with centralized security via API Gateway ensures maintainability and scalability while keeping the system secure and performant.
