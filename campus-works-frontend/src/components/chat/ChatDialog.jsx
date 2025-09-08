import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Close,
  Chat as ChatIcon
} from '@mui/icons-material';
import ChatRoom from './ChatRoom';
import chatService from '@services/chatService';

const ChatDialog = ({ 
  open, 
  onClose, 
  taskId, 
  taskTitle, 
  currentUser,
  otherUser 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Check if chat service is connected
      const connected = chatService.getConnectionStatus();
      console.log('ChatDialog: Initial connection check:', connected);
      setIsConnected(connected);
      
      if (!connected) {
        setIsLoading(true);
        // Try to connect if not connected
        const token = localStorage.getItem('campusworks_auth_token');
        console.log('ChatDialog: Attempting to connect with token:', !!token);
        if (token) {
          chatService.connect(token).then((success) => {
            console.log('ChatDialog: Connection result:', success);
            setIsConnected(success);
            setIsLoading(false);
          }).catch((error) => {
            console.error('ChatDialog: Connection failed:', error);
            setIsLoading(false);
          });
        } else {
          console.error('ChatDialog: No token found');
          setIsLoading(false);
        }
      }
    }

    // Listen for connection changes
    const handleConnected = () => {
      console.log('ChatDialog: Connection established');
      setIsConnected(true);
      setIsLoading(false);
    };

    const handleDisconnected = () => {
      console.log('ChatDialog: Connection lost');
      setIsConnected(false);
    };

    chatService.on('connected', handleConnected);
    chatService.on('disconnected', handleDisconnected);

    return () => {
      chatService.off('connected', handleConnected);
      chatService.off('disconnected', handleDisconnected);
    };
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const getDialogTitle = () => {
    if (otherUser) {
      return `Chat - ${taskTitle}`;
    }
    return `Chat - ${taskTitle}`;
  };

  const getDialogSubtitle = () => {
    if (otherUser) {
      return `Chatting with ${otherUser.email}`;
    }
    return 'Loading chat...';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon color="primary" />
            <Box>
              <Typography variant="h6" component="div">
                {getDialogTitle()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getDialogSubtitle()}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ ml: 1 }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Connecting to chat service...
            </Typography>
          </Box>
        ) : (
          <ChatRoom
            taskId={taskId}
            taskTitle={taskTitle}
            currentUser={currentUser}
            isOpen={open}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
