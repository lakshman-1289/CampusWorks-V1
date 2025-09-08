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
  Stack,
  Divider
} from '@mui/material';
import {
  Visibility,
  AttachMoney,
  Person,
  Schedule,
  CheckCircle,
  Cancel,
  Gavel
} from '@mui/icons-material';
import CountdownTimer from '@components/common/CountdownTimer';

const BidCard = ({
  bid,
  onView,
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
      default: return <Gavel />;
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

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { expired: true, text: 'Expired' };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes}m` };
    } else {
      return { expired: false, text: `${minutes}m` };
    }
  };

  const timeRemaining = getTimeRemaining(bid.taskBiddingDeadline);

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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        transformStyle: 'preserve-3d',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02) rotateY(360deg)',
          boxShadow: '0 20px 40px rgba(88, 233, 134, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(88, 233, 134, 0.6)',
          background: 'rgba(255, 255, 255, 1)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .card-header': {
            background: 'linear-gradient(135deg, rgba(88, 233, 134, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          },
          '& .card-content': {
            background: 'rgba(88, 233, 134, 0.02)',
          }
        },
        '&:active, &:focus': {
          transform: 'translateY(-8px) scale(1.02) rotateY(360deg)',
          boxShadow: '0 20px 40px rgba(88, 233, 134, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(88, 233, 134, 0.6)',
          background: 'rgba(255, 255, 255, 1)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .card-header': {
            background: 'linear-gradient(135deg, rgba(88, 233, 134, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          },
          '& .card-content': {
            background: 'rgba(88, 233, 134, 0.02)',
          }
        },
        // Touch device specific styles
        '@media (hover: none) and (pointer: coarse)': {
          '&:active': {
            transform: 'translateY(-4px) scale(1.01) rotateY(360deg)',
            boxShadow: '0 12px 24px rgba(88, 233, 134, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
            border: '2px solid rgba(88, 233, 134, 0.8)',
            background: 'rgba(255, 255, 255, 1)',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .card-header': {
              background: 'linear-gradient(135deg, rgba(88, 233, 134, 0.08) 0%, rgba(76, 175, 80, 0.08) 100%)',
            },
            '& .card-content': {
              background: 'rgba(88, 233, 134, 0.03)',
            }
          }
        },
        ...sx 
      }}
    >
      {/* HEADER - Task Title and Status */}
      <Box 
        className="card-header"
        sx={{ 
          p: 2, 
          pb: 1, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          flexShrink: 0, // Prevent header from shrinking
          height: variant === 'compact' ? '70px' : '80px', // Responsive header height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden', // Prevent horizontal overflow
          width: '100%' // Ensure full width
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          width: '100%',
          overflow: 'hidden' // Prevent horizontal overflow
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
            {bid.taskTitle}
          </Typography>
          <Chip
            icon={getStatusIcon(bid.status)}
            label={bid.status}
            color={getStatusColor(bid.status)}
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Box>
      </Box>

      {/* BODY - All Bid Details (Scrollable) */}
      <CardContent 
        className="card-content"
        sx={{ 
          flex: 1,
          overflow: 'auto !important',
          p: 2,
          height: variant === 'compact' ? 'calc(400px - 140px)' : 'calc(500px - 160px)', // Responsive body height
          maxHeight: variant === 'compact' ? 'calc(400px - 140px)' : 'calc(500px - 160px)',
          minHeight: 0,
          width: '100%', // Ensure full width
          overflowX: 'auto', // Horizontal scroll when needed
          overflowY: 'auto', // Vertical scroll when needed
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
        <Stack spacing={2}>
          {/* Bid Amount */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {formatCurrency(bid.amount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              / {formatCurrency(bid.taskBudget)}
            </Typography>
          </Box>

          {/* Bidder Email */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="action" />
            <Typography variant="body2" color="text.secondary">
              {bid.bidderEmail}
            </Typography>
          </Box>

          {/* Proposal */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Proposal:
            </Typography>
            <Typography variant="body2" sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              whiteSpace: 'normal'
            }}>
              {bid.proposal || 'No proposal provided'}
            </Typography>
          </Box>

          <Divider />

          {/* Bid Placed Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule color="action" />
            <Typography variant="body2" color="text.secondary">
              Bid placed: {formatDate(bid.createdAt)}
            </Typography>
          </Box>

          {/* Time Remaining */}
          {timeRemaining.expired ? (
            <Chip label="Bidding Expired" color="error" size="small" />
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bidding ends in:
              </Typography>
              <CountdownTimer deadline={bid.taskBiddingDeadline} />
            </Box>
          )}
        </Stack>
      </CardContent>

      {/* FOOTER - View Task Button */}
      <CardActions sx={{ 
        p: 2, 
        pt: 1, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0, // Prevent footer from shrinking
        height: variant === 'compact' ? '70px' : '80px', // Responsive footer height
        minHeight: variant === 'compact' ? '70px' : '80px',
        maxHeight: variant === 'compact' ? '70px' : '80px',
        width: '100%', // Ensure full width
        overflow: 'hidden' // Prevent horizontal overflow
      }}>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => onView && onView(bid.taskId)}
          variant="contained"
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          View Task
        </Button>
      </CardActions>
    </Card>
  );
};

export default BidCard;
