import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Assignment,
  Edit,
  Delete,
  Visibility,
  Add,
  Publish,
  Warning,
  Info,
  Payment,
  ContentCopy,
  Chat,
  ArrowBack
} from '@mui/icons-material';
import Layout from '@components/templates/Layout';
import TaskCard from '@components/molecules/TaskCard';
import ChatButton from '@components/chat/ChatButton';
import { selectAuth } from '@store/slices/authSlice';
import { ROUTES, CATEGORY_LABELS, TASK_STATUS } from '@constants';
import apiService from '@services/api';

const MyTasksPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskBids, setTaskBids] = useState({}); // Store bids for each task
  const [repostingTask, setRepostingTask] = useState(null);
  
  // UPI ID viewing state
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [loadingUpiId, setLoadingUpiId] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchMyTasks();
    }
  }, [user?.email]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.tasks.getByOwnerEmail(user.email);
      const tasksData = response.data || [];
      setTasks(tasksData);
      
      // Fetch bids for each task
      await fetchBidsForTasks(tasksData);
      
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      setError('Failed to load your tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBidsForTasks = async (tasksData) => {
    try {
      const bidsPromises = tasksData.map(async (task) => {
        try {
          const bidsResponse = await apiService.bids.getByTask(task.id);
          return { taskId: task.id, bids: bidsResponse.data || [] };
        } catch (error) {
          console.error(`Error fetching bids for task ${task.id}:`, error);
          return { taskId: task.id, bids: [] };
        }
      });
      
      const bidsResults = await Promise.all(bidsPromises);
      const bidsMap = {};
      bidsResults.forEach(({ taskId, bids }) => {
        bidsMap[taskId] = bids;
      });
      
      setTaskBids(bidsMap);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handleViewTask = (taskId) => {
    navigate(`${ROUTES.TASK_DETAIL.replace(':id', taskId)}`);
  };

  const handleEditTask = (taskId) => {
    navigate(`${ROUTES.EDIT_TASK.replace(':id', taskId)}`);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.tasks.delete(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
        // Remove bids data for deleted task
        const newTaskBids = { ...taskBids };
        delete newTaskBids[taskId];
        setTaskBids(newTaskBids);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error deleting task:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete task.';
        
        // Show specific error messages based on the error
        if (errorMessage.includes('bids already exist')) {
          setError('You cannot delete this task because bids already exist. Please wait until the bidding deadline passes and no bids are placed.');
        } else if (errorMessage.includes('bidding period has ended')) {
          setError('You cannot delete this task because the bidding period has ended.');
        } else {
          setError(`Failed to delete task: ${errorMessage}`);
        }
      }
    }
  };

  const handleRepostTask = async (taskId) => {
    if (window.confirm('Are you sure you want to repost this task? This will make it available for bidding again.')) {
      try {
        setRepostingTask(taskId);
        
        // Get the task data
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
          throw new Error('Task not found');
        }
        
        // Create a new task with the same data but new bidding deadline
        const repostData = {
          title: task.title,
          description: task.description,
          category: task.category,
          budget: task.budget,
          completionDeadline: task.completionDeadline,
          // New bidding deadline will be set by backend (typically 7 days from now)
        };
        
        // Create the reposted task
        const response = await apiService.tasks.create(repostData);
        
        // Delete the old task
        await apiService.tasks.delete(taskId);
        
        // Update the tasks list
        setTasks(tasks.filter(t => t.id !== taskId));
        
        // Remove bids data for the old task
        const newTaskBids = { ...taskBids };
        delete newTaskBids[taskId];
        setTaskBids(newTaskBids);
        
        setError(null);
        alert('Task reposted successfully!');
        
      } catch (error) {
        console.error('Error reposting task:', error);
        setError('Failed to repost task. Please try again.');
      } finally {
        setRepostingTask(null);
      }
    }
  };

  const handleViewUpiId = async (task) => {
    try {
      setSelectedTask(task);
      setUpiId('');
      setLoadingUpiId(true);
      setUpiDialogOpen(true);
      
      // Fetch UPI ID for the task
      const response = await apiService.bids.getAcceptedBidWithUpi(task.id);
      if (response && response.data && response.data.upiId) {
        setUpiId(response.data.upiId);
      } else {
        setUpiId('No UPI ID submitted yet');
      }
    } catch (error) {
      console.error('Error fetching UPI ID:', error);
      setUpiId('Error loading UPI ID');
    } finally {
      setLoadingUpiId(false);
    }
  };

  const handleCloseUpiDialog = () => {
    setUpiDialogOpen(false);
    setSelectedTask(null);
    setUpiId('');
    setLoadingUpiId(false);
  };

  const handleCopyUpiId = () => {
    if (upiId && upiId !== 'No UPI ID submitted yet' && upiId !== 'Error loading UPI ID') {
      navigator.clipboard.writeText(upiId);
      // You could add a toast notification here
      alert('UPI ID copied to clipboard!');
    }
  };

  // Helper function to check if bidding deadline has passed
  const isBiddingDeadlinePassed = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < now;
  };

  // Helper function to check if task has no bids
  const hasNoBids = (taskId) => {
    const bids = taskBids[taskId] || [];
    return bids.length === 0;
  };

  // Helper function to check if task can be reposted (no bids + deadline passed + status is OPEN)
  const canRepostTask = (task) => {
    return (
      task.status === 'OPEN' &&
      isBiddingDeadlinePassed(task.biddingDeadline) &&
      hasNoBids(task.id)
    );
  };

  // Helper function to check if task should show View UPI ID button
  const canViewUpiId = (task) => {
    return (
      task.status === 'IN_PROGRESS' &&
      task.assignedUserEmail &&
      isBiddingDeadlinePassed(task.biddingDeadline)
    );
  };

  // Helper function to check if task should show chat button
  const canShowChat = (task) => {
    return (
      task.status === 'IN_PROGRESS' &&
      task.assignedUserEmail &&
      isBiddingDeadlinePassed(task.biddingDeadline)
    );
  };

  // Helper function to check if task can be edited or deleted
  const canEditOrDeleteTask = (task) => {
    // If task is not OPEN, cannot edit/delete
    if (task.status !== 'OPEN') {
      return false;
    }
    
    // If bidding deadline has not passed, cannot edit/delete (regardless of bids)
    if (!isBiddingDeadlinePassed(task.biddingDeadline)) {
      return false;
    }
    
    // If bidding deadline has passed, check if task has bids
    const bids = taskBids[task.id] || [];
    
    // If task has bids after deadline, cannot edit/delete permanently
    if (bids.length > 0) {
      return false;
    }
    
    // If no bids after deadline, can edit/delete
    return true;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'ACCEPTED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) {
      return { expired: true, text: 'Expired' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h ${minutes}m` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes}m` };
    } else {
      return { expired: false, text: `${minutes}m` };
    }
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
          {/* Desktop Layout */}
          <Box 
            display={{ xs: 'none', md: 'flex' }} 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 2 }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: '#ff6f00',
                  color: '#ff6f00',
                  backgroundColor: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: '#ff6f00',
                    color: '#ff6f00',
                    backgroundColor: 'rgba(255, 111, 0, 0.08)',
                    transform: 'translateX(-4px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(255, 111, 0, 0.4), 0 0 0 3px rgba(255, 111, 0, 0.2), inset 0 0 0 1px rgba(255, 111, 0, 0.3)',
                    '&::before': {
                      transform: 'translateX(0)',
                      opacity: 1
                    },
                    '& .MuiButton-startIcon': {
                      transform: 'translateX(-2px)',
                      transition: 'transform 0.3s ease',
                      color: '#ff6f00'
                    }
                  },
                  '&:active': {
                    transform: 'translateX(-2px) scale(1.02)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255, 111, 0, 0.15), rgba(255, 111, 0, 0.08))',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s ease',
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
                Back
              </Button>
            <Typography variant="h4" component="h1">
              My Tasks
            </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate(ROUTES.CREATE_TASK)}
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
                Create New Task
              </Button>
            </Box>
          </Box>

          {/* Mobile Layout */}
          <Box 
            display={{ xs: 'flex', md: 'none' }} 
            flexDirection="column" 
            gap={2} 
            sx={{ mb: 2 }}
          >
            {/* Mobile Header Row 1: Back Button + Title */}
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: '#ff6f00',
                  color: '#ff6f00',
                  backgroundColor: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: '#ff6f00',
                    color: '#ff6f00',
                    backgroundColor: 'rgba(255, 111, 0, 0.08)',
                    transform: 'translateX(-4px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(255, 111, 0, 0.4), 0 0 0 3px rgba(255, 111, 0, 0.2), inset 0 0 0 1px rgba(255, 111, 0, 0.3)',
                    '&::before': {
                      transform: 'translateX(0)',
                      opacity: 1
                    },
                    '& .MuiButton-startIcon': {
                      transform: 'translateX(-2px)',
                      transition: 'transform 0.3s ease',
                      color: '#ff6f00'
                    }
                  },
                  '&:active': {
                    transform: 'translateX(-2px) scale(1.02)',
                    transition: 'all 0.1s ease'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255, 111, 0, 0.15), rgba(255, 111, 0, 0.08))',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s ease',
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
                Back
              </Button>
              <Typography variant="h4" component="h1">
                My Tasks
              </Typography>
            </Box>

            {/* Mobile Header Row 2: Action Buttons */}
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate(ROUTES.CREATE_TASK)}
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
                Create New Task
              </Button>
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary">
            Manage and track all the tasks you've created
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Tasks Created Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't created any tasks yet. Start by creating your first task!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(ROUTES.CREATE_TASK)}
            >
              Create Your First Task
            </Button>
          </Paper>
        ) : (
          <>
            {/* Warning message for tasks with active bidding */}
            {tasks.some(task => task.status === 'OPEN' && !isBiddingDeadlinePassed(task.biddingDeadline)) && (
              <Alert 
                severity="info" 
                sx={{ mb: 3 }}
                icon={<Info />}
              >
                <Typography variant="body2">
                  <strong>Note:</strong> Edit and delete options are disabled during the bidding period. 
                  Once bidding ends, you can edit/delete tasks that received no bids, or repost them.
                </Typography>
              </Alert>
            )}
            
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
              {tasks.map((task) => {
                const canRepost = canRepostTask(task);
                const canEditDelete = canEditOrDeleteTask(task);
                const timeRemaining = getTimeRemaining(task.biddingDeadline);
                const bids = taskBids[task.id] || [];
                const bidCount = bids.length;
                const isBiddingActive = !isBiddingDeadlinePassed(task.biddingDeadline);
                
                // Determine which actions to show
                const actions = {
                  view: true,
                  edit: canEditDelete && !isBiddingActive,
                  delete: canEditDelete && !isBiddingActive,
                  repost: canRepost,
                  viewUpi: canViewUpiId(task),
                  chat: canShowChat(task)
                };
                
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    variant="compact"
                    showBidCount={task.status === 'OPEN'}
                    bidCount={bidCount}
                    actions={actions}
                    currentUser={user}
                    onView={(task) => handleViewTask(task.id)}
                    onEdit={(task) => handleEditTask(task.id)}
                    onDelete={(task) => handleDeleteTask(task.id)}
                    onRepost={(task) => handleRepostTask(task.id)}
                    onViewUpi={(task) => handleViewUpiId(task)}
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
                );
              })}
              </Box>
            </Box>
          </>
        )}

        {/* Tasks Summary */}
        {tasks.length > 0 && (
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Tasks Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={2.4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {tasks.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {tasks.filter(task => task.status === 'OPEN').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Tasks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {tasks.filter(task => task.status === 'IN_PROGRESS').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {tasks.filter(task => task.status === 'COMPLETED' || task.status === 'ACCEPTED').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={2.4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main">
                    {tasks.filter(task => canRepostTask(task)).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No Bids (Can Repost)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* UPI ID Viewing Dialog */}
        <Dialog open={upiDialogOpen} onClose={handleCloseUpiDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <Payment color="primary" />
              View UPI ID
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Task Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Task:</strong> {selectedTask.title}
                </Typography>
                <Typography variant="body2">
                  <strong>Winner:</strong> {selectedTask.assignedUserEmail}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                UPI ID:
              </Typography>
              {loadingUpiId ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Loading UPI ID...</Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                  borderRadius: 1,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {upiId}
                  </Typography>
                  {upiId && upiId !== 'No UPI ID submitted yet' && upiId !== 'Error loading UPI ID' && (
                    <IconButton 
                      size="small" 
                      onClick={handleCopyUpiId}
                      sx={{
                        color: '#000000',
                        '&:hover': {
                          color: '#1976d2',
                          backgroundColor: 'rgba(25, 118, 210, 0.1)'
                        }
                      }}
                    >
                      <ContentCopy />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Use this UPI ID to make payment to the task winner. 
                The winner will receive the payment amount minus platform fees.
              </Typography>
            </Alert>
            
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Next Step:</strong> After making the payment, click the <strong>View (👁️)</strong> button 
                on the task card to go to Task Details page where you can click the <strong>"Accept Work"</strong> 
                button to confirm the task completion.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseUpiDialog}
              sx={{
                color: '#000000',
                borderColor: '#000000',
                '&:hover': {
                  color: '#1976d2',
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                }
              }}
              variant="outlined"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default MyTasksPage;
