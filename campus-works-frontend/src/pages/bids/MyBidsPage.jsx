import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText
} from '@mui/material';
import {
  Gavel,
  Assignment,
  Refresh,
  Payment,
  Chat,
  ArrowBack
} from '@mui/icons-material';
import Layout from '@components/templates/Layout';
import MyBidCard from '@components/molecules/MyBidCard';
import ChatButton from '@components/chat/ChatButton';
import { selectAuth } from '@store/slices/authSlice';
import { ROUTES } from '@constants';
import apiService from '@services/api';
import { showEmailSuccessToast, showEmailErrorToast } from '@services/toastService';

const MyBidsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingBid, setDeletingBid] = useState(null);
  
  // UPI ID submission state
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [submittingUpi, setSubmittingUpi] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchMyBids();
    }
  }, [user?.email]);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.bids.getByUserEmail(user.email);
      console.log('Bids response:', response);
      console.log('Bids data:', response.data);
      
      const bidsData = response.data || [];
      console.log('Processed bids:', bidsData);
      
      // Log each bid's taskId
      bidsData.forEach((bid, index) => {
        console.log(`Bid ${index}:`, {
          id: bid.id,
          taskId: bid.taskId,
          status: bid.status,
          amount: bid.amount
        });
      });
      
      setBids(bidsData);
      
    } catch (error) {
      console.error('Error fetching my bids:', error);
      setError('Failed to load your bids. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (taskId) => {
    console.log('Viewing task with ID:', taskId);
    if (!taskId) {
      console.error('No task ID provided for viewing');
      setError('Cannot view task: No task ID provided');
      return;
    }
    navigate(`${ROUTES.TASK_DETAIL.replace(':id', taskId)}`);
  };

  const handleDeleteBid = async (bidId) => {
    if (window.confirm('Are you sure you want to delete this rejected bid? This action cannot be undone.')) {
      try {
        setDeletingBid(bidId);
        setError(null);
        
        await apiService.bids.delete(bidId);
        
        // Remove the bid from the local state
        setBids(bids.filter(bid => bid.id !== bidId));
        
      } catch (error) {
        console.error('Error deleting bid:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete bid.';
        setError(`Failed to delete bid: ${errorMessage}`);
      } finally {
        setDeletingBid(null);
      }
    }
  };

  const handleCompleteTask = async (bid) => {
    try {
      setSelectedBid(bid);
      setUpiId('');
      setUpiError('');
      setLoadingTaskDetails(true);
      
      // Fetch task details to populate the modal
      if (bid.taskId) {
        const taskResponse = await apiService.tasks.getById(bid.taskId);
        if (taskResponse && taskResponse.data) {
          // Update the selectedBid with task details
          const updatedBid = {
            ...bid,
            task: {
              title: taskResponse.data.title,
              ownerEmail: taskResponse.data.ownerEmail,
              budget: taskResponse.data.budget
            }
          };
          setSelectedBid(updatedBid);
        }
      }
      
      setUpiDialogOpen(true);
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError('Failed to load task details. Please try again.');
    } finally {
      setLoadingTaskDetails(false);
    }
  };

  const handleSubmitUpiId = async () => {
    if (!upiId.trim()) {
      setUpiError('UPI ID is required');
      return;
    }

    if (upiId.length < 5 || upiId.length > 50) {
      setUpiError('UPI ID must be between 5 and 50 characters');
      return;
    }

    try {
      setSubmittingUpi(true);
      setUpiError('');

      const response = await apiService.bids.submitUpiId(selectedBid.id, { upiId: upiId.trim() });
      
      if (response.data) {
        // Update the bid in the local state
        setBids(prevBids => 
          prevBids.map(bid => 
            bid.id === selectedBid.id 
              ? { ...bid, upiId: upiId.trim(), upiIdSubmittedAt: new Date().toISOString() }
              : bid
          )
        );
        
        // Show success toast notification
        dispatch(showEmailSuccessToast('upi_submitted'));
        
        setUpiDialogOpen(false);
        setSelectedBid(null);
        setUpiId('');
      }
    } catch (error) {
      console.error('Error submitting UPI ID:', error);
      setUpiError(error.response?.data?.message || 'Failed to submit UPI ID. Please try again.');
      
      // Show error toast notification
      dispatch(showEmailErrorToast('upi_submitted'));
    } finally {
      setSubmittingUpi(false);
    }
  };

  const handleCloseUpiDialog = () => {
    setUpiDialogOpen(false);
    setSelectedBid(null);
    setUpiId('');
    setUpiError('');
    setLoadingTaskDetails(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };


  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(-1)}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    borderColor: '#e0e0e0',
                    color: '#666',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      transform: 'translateX(-4px) scale(1.05)',
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4), 0 0 0 3px rgba(25, 118, 210, 0.2), inset 0 0 0 1px rgba(25, 118, 210, 0.3)',
                      '&::before': {
                        transform: 'translateX(0)',
                        opacity: 1
                      },
                      '& .MuiButton-startIcon': {
                        transform: 'translateX(-2px)',
                        transition: 'transform 0.3s ease',
                        color: '#1976d2'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.15), rgba(25, 118, 210, 0.08))',
                      transform: 'translateX(-100%)',
                      transition: 'all 0.4s ease',
                      opacity: 0,
                      zIndex: 0
                    },
                    '& .MuiButton-startIcon': {
                      position: 'relative',
                      zIndex: 1,
                      transition: 'transform 0.3s ease'
                    },
                    '& .MuiButton-label': {
                      position: 'relative',
                      zIndex: 1
                    }
                  }}
                >
                  Back
                </Button>
                <Typography variant="h4" component="h1">
                  My Bids
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchMyBids}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  borderColor: '#e0e0e0',
                  color: '#666',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateY(-2px) scale(1.08)',
                    boxShadow: '0 12px 30px rgba(25, 118, 210, 0.4), 0 0 0 3px rgba(25, 118, 210, 0.2), inset 0 0 0 1px rgba(25, 118, 210, 0.3)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    },
                    '& .MuiButton-startIcon': {
                      animation: 'spin 0.8s ease-in-out',
                      transform: 'rotate(360deg)',
                      color: '#1976d2'
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
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%) scale(0)',
                    transition: 'all 0.4s ease',
                    opacity: 0,
                    zIndex: 0
                  },
                  '& .MuiButton-startIcon': {
                    position: 'relative',
                    zIndex: 1,
                    transition: 'transform 0.3s ease'
                  },
                  '& .MuiButton-label': {
                    position: 'relative',
                    zIndex: 1
                  },
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)'
                    },
                    '100%': {
                      transform: 'rotate(360deg)'
                    }
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Track the status of all your submitted bids
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Bids List */}
          {bids.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Gavel sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No Bids Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You haven't placed any bids yet. Start browsing tasks to find opportunities!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => navigate(ROUTES.TASKS)}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Browse Tasks
              </Button>
            </Paper>
          ) : (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 2,
              alignItems: 'center',
              '&::-webkit-scrollbar': {
                height: '8px',
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
            }}>
              {/* Responsive Grid Layout */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr', // 1 column on mobile
                    sm: 'repeat(2, 1fr)', // 2 columns on small screens
                    md: 'repeat(3, 1fr)', // 3 columns on medium screens and up (laptop/desktop)
                  },
                  gap: 2,
                  width: '100%',
                  maxWidth: {
                    xs: '100%', // Full width on mobile
                    sm: 'calc(350px * 2 + 16px)', // Fixed width for 2 cards on small screens
                    md: 'calc(350px * 3 + 32px)', // Fixed width for 3 cards on laptop/desktop
                  },
                  justifyContent: 'center',
                  justifyItems: 'center'
                }}
              >
                {bids.map((bid) => (
                  <MyBidCard
                    key={bid.id}
                    bid={bid}
                    variant="compact"
                    currentUser={user}
                    onView={handleViewTask}
                    onDelete={handleDeleteBid}
                    onComplete={handleCompleteTask}
                    deletingBid={deletingBid}
                    sx={{
                      width: {
                        xs: '100%', // Full width on mobile
                        sm: '350px', // Fixed width on small screens
                        md: '350px', // Fixed width on laptop/desktop
                      },
                      maxWidth: {
                        xs: '100%',
                        sm: '350px',
                        md: '350px'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* UPI ID Submission Dialog */}
          <Dialog open={upiDialogOpen} onClose={handleCloseUpiDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Payment color="primary" />
                Complete Task - Submit UPI ID
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                You are about to mark this task as complete. Please provide your UPI ID so the task owner can make the payment.
              </DialogContentText>
              
              {selectedBid && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Task Details:
                  </Typography>
                  {loadingTaskDetails ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Loading task details...</Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2">
                        <strong>Task:</strong> {selectedBid.task?.title || 'Loading...'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Your Bid:</strong> {formatCurrency(selectedBid.amount)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Task Owner:</strong> {selectedBid.task?.ownerEmail || 'Loading...'}
                      </Typography>
                    </>
                  )}
                </Box>
              )}
              
              <TextField
                autoFocus
                margin="dense"
                label="UPI ID"
                placeholder="Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)"
                fullWidth
                variant="outlined"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                error={!!upiError}
                helperText={upiError || "Enter your UPI ID so the task owner can pay you"}
                disabled={submittingUpi}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Once you submit your UPI ID, the task owner will be able to view it and make the payment. 
                  Make sure your UPI ID is correct and active.
                </Typography>
              </Alert>
              
              {selectedBid?.task?.completionDeadline && getDeadlineWarning(selectedBid.task.completionDeadline) && (
                <Alert severity={getDeadlineStatusColor(selectedBid.task.completionDeadline)} sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Deadline Alert:</strong> {getDeadlineWarning(selectedBid.task.completionDeadline)}
                  </Typography>
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseUpiDialog} disabled={submittingUpi}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitUpiId}
                variant="contained"
                disabled={submittingUpi || !upiId.trim()}
                startIcon={submittingUpi ? <CircularProgress size={20} /> : <Payment />}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                  }
                }}
              >
                {submittingUpi ? 'Submitting...' : 'Submit UPI ID'}
              </Button>
            </DialogActions>
          </Dialog>
      </Container>
    </Layout>
  );
};

export default MyBidsPage;
