import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Gavel,
  Schedule,
  AttachMoney,
  Category,
  Person,
  Publish,
  Payment,
  Chat
} from '@mui/icons-material';
import CountdownTimer from '@components/common/CountdownTimer';
import ChatButton from '@components/chat/ChatButton';
import { CATEGORY_LABELS, STATUS_COLORS } from '@constants';
import apiService from '@services/api';

const TaskCard = ({
  task,
  actions = {},
  showBidCount = false,
  bidCount = 0,
  hasUserBid = false,
  onView,
  onEdit,
  onDelete,
  onBid,
  onRepost,
  onComplete,
  onViewUpi,
  onChat,
  currentUser,
  className = '',
  sx = {},
  variant = 'default' // 'default' or 'compact'
}) => {
  // State for winning bid details
  const [winningBid, setWinningBid] = useState(null);
  const [loadingWinningBid, setLoadingWinningBid] = useState(false);

  // Fetch winning bid details when task has assigned user
  useEffect(() => {
    const fetchWinningBid = async () => {
      if (task.assignedUserEmail && isDeadlineExpired(task.biddingDeadline)) {
        try {
          setLoadingWinningBid(true);
          const response = await apiService.bids.getWinningBid(task.id);
          if (response && response.data) {
            setWinningBid(response.data);
          }
        } catch (error) {
          console.error('Error fetching winning bid:', error);
          // Don't show error to user, just don't display winning bid details
        } finally {
          setLoadingWinningBid(false);
        }
      }
    };

    fetchWinningBid();
  }, [task.id, task.assignedUserEmail, task.biddingDeadline]);

  // Helper functions
  const getStatusColor = (status) => {
    const colorMap = {
      'OPEN': 'primary',
      'IN_PROGRESS': 'warning',
      'COMPLETED': 'success',
      'ACCEPTED': 'success',
      'CANCELLED': 'error'
    };
    return colorMap[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (deadline) => {
    if (!deadline) return { text: 'No deadline', expired: true };
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { text: 'Expired', expired: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { text: `${days}d ${hours}h`, expired: false };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, expired: false };
    } else {
      return { text: `${minutes}m`, expired: false };
    }
  };

  const isDeadlineExpired = (deadline) => {
    if (!deadline) return true;
    return new Date(deadline) <= new Date();
  };

  const timeRemaining = getTimeRemaining(task.biddingDeadline);
  const isExpired = timeRemaining.expired;

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
        '&:hover, &:active, &:focus': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(255, 111, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(255, 111, 0, 0.6)',
          background: 'rgba(255, 255, 255, 1)',
          '& .card-header': {
            background: 'linear-gradient(135deg, rgba(255, 111, 0, 0.05) 0%, rgba(255, 165, 0, 0.05) 100%)',
          },
          '& .card-content': {
            background: 'rgba(255, 111, 0, 0.02)',
          }
        },
        // Touch device specific styles
        '@media (hover: none) and (pointer: coarse)': {
          '&:active': {
            transform: 'translateY(-4px) scale(1.01)',
            boxShadow: '0 12px 24px rgba(255, 111, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
            border: '2px solid rgba(255, 111, 0, 0.8)',
            background: 'rgba(255, 255, 255, 1)',
            '& .card-header': {
              background: 'linear-gradient(135deg, rgba(255, 111, 0, 0.08) 0%, rgba(255, 165, 0, 0.08) 100%)',
            },
            '& .card-content': {
              background: 'rgba(255, 111, 0, 0.03)',
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
            {task.title}
          </Typography>
          <Chip
            label={task.status}
            color={getStatusColor(task.status)}
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Box>
      </Box>

      {/* BODY - All Task Details (Scrollable) */}
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
        {/* Task Details */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AttachMoney sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ₹{task.budget?.toFixed(2) || '0.00'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Category sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">
              {CATEGORY_LABELS[task.category] || task.category}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">
              {task.ownerEmail}
            </Typography>
          </Box>

          {/* Winner Information - Show when bidding has ended and winner is selected */}
          {task.assignedUserEmail && isDeadlineExpired(task.biddingDeadline) && (
            <Box sx={{ 
              mb: 1,
              p: 1,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderRadius: 1,
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Gavel sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  Winner: {task.assignedUserEmail}
                </Typography>
              </Box>
              
              {loadingWinningBid ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3 }}>
                  <CircularProgress size={12} />
                  <Typography variant="caption" color="text.secondary">
                    Loading bid details...
                  </Typography>
                </Box>
              ) : winningBid ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, ml: 3 }}>
                    <AttachMoney sx={{ mr: 0.5, fontSize: 14, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      Winning Bid: ₹{winningBid.amount?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  {winningBid.proposal && (
                    <Box sx={{ ml: 3 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        "{winningBid.proposal.length > 50 ? 
                          `${winningBid.proposal.substring(0, 50)}...` : 
                          winningBid.proposal}"
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                  Bid details not available
                </Typography>
              )}
            </Box>
          )}

          {task.completionDeadline && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                Due: {formatDate(task.completionDeadline)}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Created: {formatDate(task.createdAt)}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Bidding ends: {formatDate(task.biddingDeadline)}
          </Typography>
        </Box>

        {/* Description */}
        {task.description && (
          <Box sx={{ 
            mb: 2,
            width: '100%',
            overflow: 'hidden' // Prevent horizontal expansion
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Description:
            </Typography>
            <Box sx={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f0f0f0',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ccc',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#999',
              }
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  wordBreak: 'break-word', // Break long words
                  whiteSpace: 'pre-wrap', // Preserve line breaks but wrap text
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 4, // Show more lines
                  WebkitBoxOrient: 'vertical',
                  maxWidth: '100%'
                }}
              >
                {task.description}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Bid Information */}
        {showBidCount && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Bids:</strong> {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
            </Typography>
            {hasUserBid && (
              <Chip
                label="Bid Placed"
                color="info"
                size="small"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        )}

        {/* UPI ID Status */}
        {task.upiId && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<Payment />}
              label="UPI ID Submitted"
              color="info"
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        {/* Deadline Warnings */}
        {task.completionDeadline && isDeadlineExpired(task.completionDeadline) && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<Schedule />}
              label="Deadline Expired"
              color="error"
              size="small"
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>

      {/* FOOTER - Time Remaining (Left) and Actions (Right) */}
      <CardActions sx={{ 
        p: 2, 
        pt: 1, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0, // Prevent footer from shrinking
        height: variant === 'compact' ? '70px' : '80px', // Responsive footer height
        minHeight: variant === 'compact' ? '70px' : '80px',
        maxHeight: variant === 'compact' ? '70px' : '80px',
        width: '100%', // Ensure full width
        overflow: 'hidden' // Prevent horizontal overflow
      }}>
        {/* LEFT - Time Remaining (Single Indicator) */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {task.status === 'COMPLETED' ? (
            <Chip
              label="Completed"
              color="success"
              size="small"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: '#e8f5e8',
                color: '#2e7d32',
                '&:hover': {
                  backgroundColor: '#c8e6c9'
                }
              }}
            />
          ) : isExpired ? (
            <Chip
              label="Expired"
              color="error"
              size="small"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: '#ffebee',
                color: '#c62828',
                '&:hover': {
                  backgroundColor: '#ffcdd2'
                }
              }}
            />
          ) : (
            <CountdownTimer 
              deadline={task.biddingDeadline}
              variant="compact"
              size="small"
            />
          )}
        </Box>

        {/* RIGHT - Action Icons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* View Action */}
          {actions.view !== false && onView && (
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => onView(task)}
                sx={{
                  color: '#000000',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3), 0 0 0 2px rgba(25, 118, 210, 0.2)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(1.05)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.2) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.4s ease',
                    opacity: 0,
                    zIndex: 0
                  }
                }}
              >
                <Visibility sx={{ position: 'relative', zIndex: 1 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Edit Action */}
          {actions.edit && onEdit && (
            <Tooltip title="Edit Task">
              <IconButton
                size="small"
                onClick={() => onEdit(task)}
                sx={{
                  color: '#000000',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3), 0 0 0 2px rgba(25, 118, 210, 0.2)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(1.05)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.2) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.4s ease',
                    opacity: 0,
                    zIndex: 0
                  }
                }}
              >
                <Edit sx={{ position: 'relative', zIndex: 1 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Delete Action */}
          {actions.delete && onDelete && (
            <Tooltip title="Delete Task">
              <IconButton
                size="small"
                onClick={() => onDelete(task)}
                sx={{
                  color: '#d32f2f',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#b71c1c',
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3), 0 0 0 2px rgba(211, 47, 47, 0.2)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(1.05)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: 'radial-gradient(circle, rgba(211, 47, 47, 0.2) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.4s ease',
                    opacity: 0,
                    zIndex: 0
                  }
                }}
              >
                <Delete sx={{ position: 'relative', zIndex: 1 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Bid Action */}
          {actions.bid && onBid && (
            <Tooltip title="Place Bid">
              <IconButton
                size="small"
                onClick={() => onBid(task)}
                sx={{
                  color: '#000000',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3), 0 0 0 2px rgba(25, 118, 210, 0.2)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(1.05)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.2) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.4s ease',
                    opacity: 0,
                    zIndex: 0
                  }
                }}
              >
                <Gavel sx={{ position: 'relative', zIndex: 1 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Repost Action */}
          {actions.repost && onRepost && (
            <Tooltip title="Repost Task">
              <IconButton
                size="small"
                onClick={() => onRepost(task)}
                sx={{
                  color: '#000000',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'translateY(-2px) scale(1.1)',
                    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3), 0 0 0 2px rgba(25, 118, 210, 0.2)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(1.05)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.2) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.4s ease',
                    opacity: 0,
                    zIndex: 0
                  }
                }}
              >
                <Publish sx={{ position: 'relative', zIndex: 1 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Complete Task Action */}
          {actions.complete && onComplete && (
            <Tooltip title="Complete Task">
              <Button
                size="small"
                variant="contained"
                startIcon={<Payment />}
                onClick={() => onComplete(task)}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4), 0 0 0 3px rgba(76, 175, 80, 0.2)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    },
                    '& .MuiButton-startIcon': {
                      transform: 'rotate(360deg)',
                      transition: 'transform 0.6s ease'
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(1.02)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.6s ease',
                    opacity: 0,
                    zIndex: 0
                  },
                  '& .MuiButton-startIcon': {
                    position: 'relative',
                    zIndex: 1,
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                Complete
              </Button>
            </Tooltip>
          )}

          {/* View UPI Action */}
          {actions.viewUpi && onViewUpi && (
            <Tooltip title="View UPI ID">
              <Button
                size="small"
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => onViewUpi(task)}
                color="info"
                sx={{
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  color: '#1976d2',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                    color: '#1565c0',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3), 0 0 0 3px rgba(33, 150, 243, 0.15)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    },
                    '& .MuiButton-startIcon': {
                      transform: 'rotate(360deg)',
                      transition: 'transform 0.6s ease',
                      color: '#1565c0'
                    }
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(1.02)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: 'radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.6s ease',
                    opacity: 0,
                    zIndex: 0
                  },
                  '& .MuiButton-startIcon': {
                    position: 'relative',
                    zIndex: 1,
                    transition: 'transform 0.3s ease',
                    color: '#1976d2'
                  }
                }}
              >
                View UPI
              </Button>
            </Tooltip>
          )}

          {/* Chat Action */}
          {actions.chat && currentUser && (
            <ChatButton
              taskId={task.id}
              taskTitle={task.title}
              currentUser={currentUser}
              variant="icon"
              size="small"
            />
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default TaskCard;
