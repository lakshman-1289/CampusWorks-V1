import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  AttachMoney,
  Person,
  Schedule,
  CheckCircle,
  Cancel,
  Delete,
  Payment,
  TrendingUp,
  Chat
} from '@mui/icons-material';
import { CATEGORY_LABELS } from '@constants';
import { isDeadlineExpired, getDeadlineWarning, getDeadlineStatusColor } from '@utils/deadlineUtils';
import CountdownTimer from '@components/common/CountdownTimer';
import ChatButton from '@components/chat/ChatButton';

const MyBidCard = ({
  bid,
  onView,
  onDelete,
  onComplete,
  deletingBid,
  currentUser,
  className = '',
  sx = {},
  variant = 'default' // 'default' or 'compact'
}) => {
  // Determine card dimensions based on variant
  const cardStyles = variant === 'compact' ? {
    height: '400px',
    minHeight: '400px',
    maxHeight: '400px',
    width: '350px',
    minWidth: '350px',
    maxWidth: '350px'
  } : {
    height: '500px',
    minHeight: '500px',
    maxHeight: '500px',
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'error';
      case 'WITHDRAWN': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle />;
      case 'REJECTED': return <Cancel />;
      default: return <TrendingUp />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCompleteTask = (bid) => {
    return bid.status === 'ACCEPTED' && !bid.upiId && !isDeadlineExpired(bid.task?.completionDeadline);
  };

  const canShowChat = (bid) => {
    return bid.status === 'ACCEPTED' && bid.taskId;
  };

  return (
    <Card 
      className={className}
      sx={{ 
        ...cardStyles,
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        flexShrink: 0, // Prevent card from shrinking in flex container
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover, &:active, &:focus': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(33, 150, 243, 0.6)',
          background: 'rgba(255, 255, 255, 1)',
          '& .card-header': {
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
          },
          '& .card-content': {
            background: 'rgba(33, 150, 243, 0.02)',
          }
        },
        // Touch device specific styles
        '@media (hover: none) and (pointer: coarse)': {
          '&:active': {
            transform: 'translateY(-4px) scale(1.01)',
            boxShadow: '0 12px 24px rgba(102, 126, 234, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
            border: '2px solid rgba(33, 150, 243, 0.8)',
            background: 'rgba(255, 255, 255, 1)',
            '& .card-header': {
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(102, 126, 234, 0.08) 100%)',
            },
            '& .card-content': {
              background: 'rgba(33, 150, 243, 0.03)',
            }
          }
        },
        ...sx 
      }}
    >
      {/* HEADER - Status, Title, and Amount */}
      <Box 
        className="card-header"
        sx={{ 
          p: 2, 
          pb: 1, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          flexShrink: 0, // Prevent header from shrinking
          height: variant === 'compact' ? '100px' : '120px', // Responsive header height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden', // Prevent horizontal overflow
          width: '100%', // Ensure full width
          transition: 'background 0.3s ease'
        }}>
        {/* Title and Status */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          width: '100%',
          overflow: 'hidden', // Prevent horizontal overflow
          mb: 1
        }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              flex: 1,
              mr: 1,
              maxHeight: '48px', // Limit title height
              wordBreak: 'break-word', // Break long words
              whiteSpace: 'normal' // Allow text wrapping
            }}
          >
            {bid.task?.title || 'Loading...'}
          </Typography>
          <Chip
            icon={getStatusIcon(bid.status)}
            label={bid.status}
            color={getStatusColor(bid.status)}
            size="small"
            sx={{ flexShrink: 0, fontWeight: 'bold' }}
          />
        </Box>

        {/* Category and Amount */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {bid.task?.category && (
              <Chip
                label={CATEGORY_LABELS[bid.task.category] || bid.task.category}
                size="small"
                variant="outlined"
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp sx={{ color: 'success.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {formatCurrency(bid.amount)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* BODY - All Bid Details (Scrollable) */}
      <CardContent 
        className="card-content"
        sx={{ 
          flex: 1,
          overflow: 'auto !important',
          p: 2,
          height: variant === 'compact' ? 'calc(400px - 200px)' : 'calc(500px - 220px)', // Responsive body height
          maxHeight: variant === 'compact' ? 'calc(400px - 200px)' : 'calc(500px - 220px)',
          minHeight: 0,
          width: '100%', // Ensure full width
          overflowX: 'auto', // Horizontal scroll when needed
          overflowY: 'auto', // Vertical scroll when needed
          transition: 'background 0.3s ease',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px', // For horizontal scrollbar
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          }
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, fontSize: 16 }} />
                <strong>Your Bid:</strong> {formatCurrency(bid.amount)}
              </Typography>
              {bid.task?.budget && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ mr: 1, fontSize: 16 }} />
                  <strong>Task Budget:</strong> {formatCurrency(bid.task.budget)}
                </Typography>
              )}
              {bid.task?.ownerEmail && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, fontSize: 16 }} />
                  <strong>Task Owner:</strong> {bid.task.ownerEmail}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, fontSize: 16 }} />
                <strong>Bid Placed:</strong> {formatDate(bid.createdAt)}
              </Typography>
              {bid.task?.completionDeadline && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, fontSize: 16 }} />
                  <strong>Task Deadline:</strong> {formatDate(bid.task.completionDeadline)}
                </Typography>
              )}
              
              {/* Live Countdown Timer for Accepted Bids */}
              {bid.status === 'ACCEPTED' && bid.task?.completionDeadline && !isDeadlineExpired(bid.task.completionDeadline) && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, fontWeight: 'bold' }}>
                    <Schedule sx={{ mr: 1, fontSize: 16 }} />
                    Time Remaining:
                  </Typography>
                  <CountdownTimer 
                    deadline={bid.task.completionDeadline}
                    variant="compact"
                    size="small"
                  />
                </Box>
              )}
              {bid.updatedAt && bid.updatedAt !== bid.createdAt && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, fontSize: 16 }} />
                  <strong>Last Updated:</strong> {formatDate(bid.updatedAt)}
                </Typography>
              )}
              {bid.acceptedAt && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'success.main' }}>
                  <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
                  <strong>Accepted At:</strong> {formatDate(bid.acceptedAt)}
                </Typography>
              )}
              {bid.rejectedAt && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'error.main' }}>
                  <Cancel sx={{ mr: 1, fontSize: 16 }} />
                  <strong>Rejected At:</strong> {formatDate(bid.rejectedAt)}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Bid Proposal */}
        {bid.proposal && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Your Proposal:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                p: 2,
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(102, 126, 234, 0.1)',
                fontStyle: 'italic',
                wordBreak: 'break-word',
                whiteSpace: 'normal'
              }}
            >
              {bid.proposal}
            </Typography>
          </Box>
        )}

        {/* Rejection Reason */}
        {bid.status === 'REJECTED' && bid.rejectionReason && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
              Rejection Reason:
            </Typography>
            <Typography
              variant="body2"
              color="error.main"
              sx={{
                p: 2,
                backgroundColor: 'rgba(244, 67, 54, 0.05)',
                borderRadius: 1,
                border: '1px solid rgba(244, 67, 54, 0.1)',
                fontStyle: 'italic',
                wordBreak: 'break-word',
                whiteSpace: 'normal'
              }}
            >
              {bid.rejectionReason}
            </Typography>
          </Box>
        )}

        {/* Task Description */}
        {bid.task?.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Task Description:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
                whiteSpace: 'normal'
              }}
            >
              {bid.task.description}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* FOOTER - Action Buttons and Status Chips */}
      <CardActions sx={{ 
        p: 2, 
        pt: 1, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0, // Prevent footer from shrinking
        height: variant === 'compact' ? '100px' : '120px', // Responsive footer height
        minHeight: variant === 'compact' ? '100px' : '120px',
        maxHeight: variant === 'compact' ? '100px' : '120px',
        width: '100%', // Ensure full width
        overflow: 'hidden', // Prevent horizontal overflow
        flexWrap: 'wrap',
        gap: 1
      }}>
        {/* Left side - Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title={bid.taskId ? "View Task Details" : "Task ID not available"}>
            <span>
              <IconButton
                size="small"
                onClick={() => onView && onView(bid.taskId)}
                disabled={!bid.taskId}
                sx={{
                  color: '#000000',
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  },
                  '&:disabled': {
                    color: '#ccc'
                  }
                }}
              >
                <Visibility />
              </IconButton>
            </span>
          </Tooltip>
          
          {/* Delete Button for Rejected Bids */}
          {bid.status === 'REJECTED' && (
            <Tooltip title="Delete Rejected Bid">
              <IconButton
                size="small"
                onClick={() => onDelete && onDelete(bid.id)}
                color="error"
                disabled={deletingBid === bid.id}
              >
                {deletingBid === bid.id ? <CircularProgress size={16} /> : <Delete />}
              </IconButton>
            </Tooltip>
          )}
          
          {/* Complete Task Button */}
          {canCompleteTask(bid) && (
            <Tooltip title="Complete Task - Submit UPI ID">
              <Button
                size="small"
                variant="contained"
                startIcon={<Payment />}
                onClick={() => onComplete && onComplete(bid)}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                  }
                }}
              >
                Complete Task
              </Button>
            </Tooltip>
          )}

          {/* Chat Button */}
          {canShowChat(bid) && currentUser && (
            <ChatButton
              taskId={bid.taskId}
              taskTitle={bid.task?.title || 'Task'}
              currentUser={currentUser}
              variant="icon"
              size="small"
            />
          )}
        </Box>

        {/* Right side - Status Chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* UPI ID Submitted Status */}
          {bid.status === 'ACCEPTED' && bid.upiId && (
            <Chip
              icon={<Payment />}
              label="UPI ID Submitted"
              color="info"
              size="small"
            />
          )}
          
          {/* Task Deadline Expired Warning */}
          {bid.status === 'ACCEPTED' && isDeadlineExpired(bid.task?.completionDeadline) && (
            <Chip
              icon={<Schedule />}
              label="Deadline Expired"
              color="error"
              size="small"
            />
          )}
          
          {/* Deadline Warning */}
          {bid.status === 'ACCEPTED' && !isDeadlineExpired(bid.task?.completionDeadline) && getDeadlineWarning(bid.task?.completionDeadline) && (
            <Chip
              icon={<Schedule />}
              label="Deadline Soon"
              color={getDeadlineStatusColor(bid.task?.completionDeadline)}
              size="small"
            />
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default MyBidCard;
