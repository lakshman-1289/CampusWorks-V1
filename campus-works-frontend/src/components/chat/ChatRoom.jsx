
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  Send,
  AttachFile,
  Close,
  Refresh
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import chatService from '@services/chatService';

const ChatRoom = ({ 
  taskId, 
  taskTitle, 
  currentUser, 
  onClose,
  isOpen = true 
}) => {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Setup chat service listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleRoomJoined = (data) => {
      console.log('Room joined - Room data:', data.room);
      console.log('Room joined - Messages:', data.messages);
      setRoom(data.room);
      setMessages(data.messages || []);
      setIsLoading(false);
      setError(null);
      setIsConnected(true);
    };

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserTyping = (data) => {
      if (data.userId !== currentUser.id) {
        setOtherUserTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (data) => {
      // Update unread count if needed
      if (room && data.roomId === room.id) {
        setRoom(prev => ({
          ...prev,
          unreadCount: {
            ...prev.unreadCount,
            [currentUser.role === 'owner' ? 'owner' : 'bidder']: data.unreadCount
          }
        }));
      }
    };

    const handleError = (error) => {
      console.error('Chat error:', error);
      const errorMessage = error.message || 'Chat service error';
      setError(errorMessage);
      
      // If it's a task not found error, try to provide more context
      if (errorMessage.includes('Task not found')) {
        setError(`Task not found. Please ensure the task exists and you have access to it. (Task ID: ${taskId})`);
      }
    };

    const handleConnected = () => {
      console.log('ChatRoom: Connection established');
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = (reason) => {
      console.log('ChatRoom: Connection lost:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        setError('Connection lost. Attempting to reconnect...');
      }
    };

    // Add event listeners
    chatService.on('room-joined', handleRoomJoined);
    chatService.on('new-message', handleNewMessage);
    chatService.on('user-typing', handleUserTyping);
    chatService.on('messages-read', handleMessagesRead);
    chatService.on('error', handleError);
    chatService.on('connected', handleConnected);
    chatService.on('disconnected', handleDisconnected);

    // Join room when component mounts
    if (taskId && isConnected) {
      setIsLoading(true);
      chatService.joinTaskRoom(taskId);
    }

    // Cleanup
    return () => {
      chatService.off('room-joined', handleRoomJoined);
      chatService.off('new-message', handleNewMessage);
      chatService.off('user-typing', handleUserTyping);
      chatService.off('messages-read', handleMessagesRead);
      chatService.off('error', handleError);
      chatService.off('connected', handleConnected);
      chatService.off('disconnected', handleDisconnected);
    };
  }, [taskId, currentUser, isOpen, isConnected]);

  // Auto-join room when connected
  useEffect(() => {
    const connectionStatus = chatService.getConnectionStatus();
    console.log('ChatRoom: Checking connection status:', { 
      isConnected, 
      connectionStatus, 
      taskId, 
      hasRoom: !!room 
    });
    
    if (connectionStatus && taskId && !room) {
      console.log('ChatRoom: Joining task room:', taskId);
      setIsLoading(true);
      chatService.joinTaskRoom(taskId);
    }
  }, [isConnected, taskId, room]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    chatService.sendMessage(taskId, newMessage.trim());
    setNewMessage('');
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim()) {
      chatService.sendTyping(taskId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendStopTyping(taskId);
      }, 3000);
    } else {
      chatService.sendStopTyping(taskId);
    }
  };

  const handleReconnect = () => {
    setError(null);
    setIsLoading(true);
    chatService.reconnect(localStorage.getItem('campusworks_auth_token'));
  };

  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  const renderMessage = (message) => {
    // Normalize IDs to numbers for comparison
    const currentUserId = parseInt(currentUser.id || currentUser._id);
    const messageSenderId = parseInt(message.senderId);
    
    // ✅ Determine sender role from room data
    let senderRole = 'bidder'; // Default to bidder
    
    if (room) {
      if (messageSenderId === parseInt(room.ownerId)) {
        senderRole = 'owner';
      } else if (messageSenderId === parseInt(room.bidderId)) {
        senderRole = 'bidder';
      } else {
        // If user is neither owner nor bidder, check if they're the current user
        if (messageSenderId === currentUserId) {
          // Determine current user's role
          if (currentUserId === parseInt(room.ownerId)) {
            senderRole = 'owner';
          } else {
            senderRole = 'bidder';
          }
        } else {
          senderRole = 'bidder'; // Default fallback
        }
      }
    }
    
    // ✅ STRICT POSITIONING: Based on sender role
    const isMessageFromTaskOwner = senderRole === 'owner';
    const isMessageFromBidder = senderRole === 'bidder';
    
    // ✅ FORCE: Position based on sender role only
    const shouldAlignRight = isMessageFromTaskOwner; // Owner = RIGHT, Bidder = LEFT
    
    // Determine if message is from current user (for read receipts only)
    const isOwnMessage = currentUserId === messageSenderId;
    
    // ✅ FIXED: Color logic based on MESSAGE SENDER'S ROLE
    const getMessageColors = () => {
      return isMessageFromTaskOwner ? {
        backgroundColor: '#2c2c2c', // BLACK for task owner
        color: '#ffffff',
        borderColor: '#2c2c2c'
      } : {
        backgroundColor: '#2196f3', // BLUE for bidder
        color: '#ffffff',
        borderColor: '#2196f3'
      };
    };
    
    const messageColors = getMessageColors();
    const messageTime = formatMessageTime(message.createdAt);
    

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: shouldAlignRight ? 'flex-end' : 'flex-start', // ✅ FIXED: Role-based positioning
          mb: 1,
          px: 2,
          py: 0.5
        }}
      >
        <Box
          sx={{
            maxWidth: '65%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: shouldAlignRight ? 'flex-end' : 'flex-start' // ✅ FIXED: Role-based alignment
          }}
        >
          <Box
            sx={{
              p: '8px 12px',
              borderRadius: shouldAlignRight ? '18px 18px 4px 18px' : '18px 18px 18px 4px', // ✅ FIXED: Role-based border radius
              wordBreak: 'break-word',
              boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
              position: 'relative',
              border: '1px solid rgba(0,0,0,0.1)',
              // Apply colors based on role: BLACK for task owner, BLUE for bidder
              backgroundColor: `${messageColors.backgroundColor} !important`,
              color: `${messageColors.color} !important`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                [shouldAlignRight ? 'right' : 'left']: -8, // ✅ FIXED: Role-based tail position
                  width: 0,
                  height: 0,
                [shouldAlignRight ? 'borderLeft' : 'borderRight']: `8px solid ${messageColors.borderColor}`, // ✅ FIXED: Role-based tail direction
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                }
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: 1.4,
                fontSize: '14px',
                fontWeight: 400,
                color: 'inherit' // Use the color from parent container
              }}
            >
              {message.message}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            mt: 0.5,
            px: 1
          }}>
          <Typography 
            variant="caption" 
            sx={{ 
                opacity: 0.6,
                fontSize: '11px',
                color: '#667781'
            }}
          >
            {messageTime}
          </Typography>
            {isOwnMessage && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: 12,
                  height: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: '#4fc3f7'
                  }} />
                </Box>
                <Box sx={{
                  width: 12,
                  height: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: -0.5
                }}>
                  <Box sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: '#4fc3f7'
                  }} />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  if (!isOpen) return null;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" noWrap>
              {taskTitle || 'Chat'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chat with your {'task partner'}
            </Typography>
            
            
            {otherUserTyping && (
              <Chip 
                label="Typing..." 
                size="small" 
                color="primary" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Connection Status */}
      {!isConnected && (
        <Alert 
          severity="warning" 
          action={
            <Button size="small" onClick={handleReconnect}>
              <Refresh sx={{ mr: 1 }} />
              Reconnect
            </Button>
          }
          sx={{ m: 1 }}
        >
          Not connected to chat service. Connection status: {chatService.getConnectionStatus() ? 'Connected' : 'Disconnected'}
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          action={
            <Button size="small" onClick={handleReconnect}>
              <Refresh sx={{ mr: 1 }} />
              Retry
            </Button>
          }
          sx={{ m: 1 }}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flex: 1 
        }}>
          <CircularProgress />
        </Box>
      )}

      {/* Messages Area */}
      {!isLoading && (
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #e5ddd5 0%, #f7f3f0 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d4' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3,
            pointerEvents: 'none'
          }
        }}>
          {messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              flex: 1,
              color: '#667781',
              flexDirection: 'column',
              gap: 2
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#667781',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Send sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#667781' }}>
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>
      )}

      {/* Message Input */}
      {!isLoading && (
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: '#e0e0e0',
          bgcolor: '#f0f0f0'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            alignItems: 'flex-end',
            bgcolor: 'white',
            borderRadius: '25px',
            p: '4px 8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={3}
              placeholder="Type a message"
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              variant="standard"
              size="small"
              disabled={!isConnected}
              sx={{
                '& .MuiInput-underline:before': {
                  borderBottom: 'none',
                },
                '& .MuiInput-underline:after': {
                  borderBottom: 'none',
                },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                  borderBottom: 'none',
                },
                '& .MuiInputBase-input': {
                  fontSize: '14px',
                  padding: '8px 12px'
                }
              }}
            />
            <IconButton 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || !isConnected}
              sx={{
                bgcolor: newMessage.trim() && isConnected ? '#25d366' : '#e0e0e0',
                color: newMessage.trim() && isConnected ? 'white' : '#9e9e9e',
                width: 40,
                height: 40,
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: newMessage.trim() && isConnected ? '#128c7e' : '#e0e0e0',
                },
                transition: 'all 0.2s ease',
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              <Send sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ChatRoom;
