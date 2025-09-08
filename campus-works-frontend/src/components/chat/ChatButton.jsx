import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  ChatBubble as ChatBubbleIcon
} from '@mui/icons-material';
import ChatDialog from './ChatDialog';
import chatService from '@services/chatService';

const ChatButton = ({ 
  taskId, 
  taskTitle, 
  currentUser, 
  variant = 'button', // 'button' or 'icon'
  size = 'medium',
  disabled = false,
  showBadge = false,
  unreadCount = 0
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      const connected = chatService.getConnectionStatus();
      setIsConnected(connected);
    };

    checkConnection();

    // Listen for connection changes
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    chatService.on('connected', handleConnected);
    chatService.on('disconnected', handleDisconnected);

    return () => {
      chatService.off('connected', handleConnected);
      chatService.off('disconnected', handleDisconnected);
    };
  }, []);

  const handleOpenChat = async () => {
    if (disabled) return;

    if (!isConnected) {
      setIsConnecting(true);
      try {
        const token = localStorage.getItem('campusworks_auth_token');
        console.log('ChatButton: Attempting to connect with token:', {
          hasToken: !!token,
          tokenLength: token?.length,
          tokenStart: token?.substring(0, 20)
        });
        
        if (token) {
          const connected = await chatService.connect(token);
          console.log('ChatButton: Connection result:', connected);
          if (connected) {
            setIsConnected(true);
            setChatOpen(true);
          } else {
            console.error('Failed to connect to chat service');
          }
        } else {
          console.error('No auth token found in localStorage');
        }
      } catch (error) {
        console.error('Failed to connect to chat:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      setChatOpen(true);
    }
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const getButtonContent = () => {
    if (isConnecting) {
      return (
        <>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          Connecting...
        </>
      );
    }

    if (variant === 'icon') {
      return showBadge && unreadCount > 0 ? (
        <Badge badgeContent={unreadCount} color="error">
          <ChatIcon />
        </Badge>
      ) : (
        <ChatIcon />
      );
    }

    return (
      <>
        <ChatIcon sx={{ mr: 1 }} />
        Open Chat
      </>
    );
  };

  const getTooltipTitle = () => {
    if (disabled) return 'Chat not available';
    if (isConnecting) return 'Connecting to chat...';
    if (!isConnected) return 'Click to connect to chat';
    return 'Open chat';
  };

  const ButtonComponent = variant === 'icon' ? IconButton : Button;

  return (
    <>
      <Tooltip title={getTooltipTitle()}>
        <span>
          <ButtonComponent
            onClick={handleOpenChat}
            disabled={disabled || isConnecting}
            size={size}
            color="primary"
            variant={variant === 'icon' ? 'text' : 'contained'}
            sx={{
              minWidth: variant === 'icon' ? 'auto' : '120px',
              ...(variant === 'icon' && {
                borderRadius: '50%',
                width: 40,
                height: 40
              })
            }}
          >
            {getButtonContent()}
          </ButtonComponent>
        </span>
      </Tooltip>

      <ChatDialog
        open={chatOpen}
        onClose={handleCloseChat}
        taskId={taskId}
        taskTitle={taskTitle}
        currentUser={currentUser}
      />
    </>
  );
};

export default ChatButton;
