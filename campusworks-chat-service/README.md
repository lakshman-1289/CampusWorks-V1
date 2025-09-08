# CampusWorks Chat Service

A real-time chat service for the CampusWorks platform, built with Node.js, Socket.io, and MongoDB.

## Features

- Real-time messaging between task owners and accepted bidders
- Chat rooms automatically created for tasks in progress
- Message history and persistence
- Typing indicators
- Message read status
- JWT authentication integration with Spring Boot
- Scalable architecture with Redis support

## Prerequisites

- Node.js 18+ 
- MongoDB
- Redis (optional, for scaling)
- Spring Boot backend running

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
PORT=3001
NODE_ENV=development
SPRING_BOOT_BASE_URL=http://localhost:8080
AUTH_SERVICE_URL=http://localhost:9000
TASK_SERVICE_URL=http://localhost:9001
BIDDING_SERVICE_URL=http://localhost:9002
JWT_SECRET=your_jwt_secret_same_as_spring_boot
MONGODB_URI=mongodb://localhost:27017/campusworks_chat
REDIS_URL=redis://localhost:6379
SOCKET_CORS_ORIGIN=http://localhost:3000
```

## Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Chat Rooms
- `POST /api/chat/rooms/task/:taskId` - Create or get chat room for task
- `GET /api/chat/rooms/task/:taskId` - Get chat room by task ID
- `GET /api/chat/rooms` - Get user's chat rooms
- `GET /api/chat/rooms/:roomId/messages` - Get messages for room
- `POST /api/chat/rooms/:roomId/messages/read` - Mark messages as read
- `GET /api/chat/unread-count` - Get unread message count

### Health Check
- `GET /health` - Service health status
- `GET /api/info` - Service information

## Socket.io Events

### Client to Server
- `join-task-room` - Join a task chat room
- `send-message` - Send a message
- `typing` - Send typing indicator
- `stop-typing` - Stop typing indicator
- `mark-messages-read` - Mark messages as read

### Server to Client
- `room-joined` - Confirmation of joining room
- `new-message` - New message received
- `user-typing` - User typing indicator
- `messages-read` - Messages marked as read
- `error` - Error occurred

## Database Models

### ChatRoom
- `taskId` - Task ID (unique)
- `taskTitle` - Task title
- `ownerId` - Task owner user ID
- `ownerEmail` - Task owner email
- `bidderId` - Accepted bidder user ID
- `bidderEmail` - Accepted bidder email
- `status` - Room status (ACTIVE, ARCHIVED, BLOCKED)
- `lastMessageAt` - Last message timestamp
- `unreadCount` - Unread message counts

### Message
- `roomId` - Chat room ID
- `taskId` - Task ID
- `senderId` - Sender user ID
- `senderEmail` - Sender email
- `message` - Message content
- `messageType` - Message type (TEXT, FILE, IMAGE, SYSTEM)
- `isRead` - Read status
- `createdAt` - Creation timestamp

### UserSession
- `userId` - User ID
- `socketId` - Socket connection ID
- `isOnline` - Online status
- `lastSeen` - Last seen timestamp

## Integration with Spring Boot

The chat service integrates with the existing Spring Boot microservices:

1. **Authentication**: Validates JWT tokens with the auth service
2. **Task Validation**: Verifies task access with the task service
3. **Bid Validation**: Checks accepted bids with the bidding service

## Frontend Integration

The chat service is integrated into the React frontend through:

1. **ChatService**: Socket.io client wrapper
2. **ChatButton**: Reusable chat button component
3. **ChatDialog**: Modal chat interface
4. **ChatRoom**: Full chat room component

## Security

- JWT token authentication
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Message length limits

## Monitoring

- Winston logging
- Health check endpoints
- Connection monitoring
- Error tracking

## Scaling

- Redis adapter for multiple instances
- MongoDB for data persistence
- Horizontal scaling support
- Load balancer ready

## Development

### Project Structure
```
src/
├── controllers/     # API controllers
├── middleware/      # Express middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── services/       # External service integrations
├── socket/         # Socket.io handlers
├── utils/          # Utility functions
└── server.js       # Main server file
```

### Adding New Features

1. Create models in `src/models/`
2. Add controllers in `src/controllers/`
3. Define routes in `src/routes/`
4. Add socket handlers in `src/socket/`
5. Update frontend components

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if Spring Boot services are running
2. **Authentication Error**: Verify JWT secret matches Spring Boot
3. **Database Error**: Ensure MongoDB is running and accessible
4. **CORS Error**: Check SOCKET_CORS_ORIGIN configuration

### Logs

Check logs in:
- Console output
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

## License

MIT License - see LICENSE file for details
