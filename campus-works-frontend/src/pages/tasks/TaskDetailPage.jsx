import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Assignment,
  Schedule,
  AttachMoney,
  Category,
  Person,
  Payment,
  TaskAlt,
  Visibility,
  Info,
  ContentCopy,
  Check
} from '@mui/icons-material';
import Layout from '@components/templates/Layout';
import { selectAuth } from '@store/slices/authSlice';
import { ROUTES, CATEGORY_LABELS } from '@constants';
import apiService from '@services/api';
import { showEmailSuccessToast, showEmailErrorToast } from '@services/toastService';
import { isDeadlineExpired, getDeadlineWarning, getDeadlineStatusColor } from '@utils/deadlineUtils';
import CountdownTimer from '@components/common/CountdownTimer';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [taskBids, setTaskBids] = useState([]);
  const [canEditDelete, setCanEditDelete] = useState(false);
  
  // UPI ID and work acceptance state
  const [acceptedBid, setAcceptedBid] = useState(null);
  const [hasUpiSubmitted, setHasUpiSubmitted] = useState(false);
  const [hasUpiViewed, setHasUpiViewed] = useState(false);
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [acceptWorkDialogOpen, setAcceptWorkDialogOpen] = useState(false);
  const [loadingUpi, setLoadingUpi] = useState(false);
  const [acceptingWork, setAcceptingWork] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);
  
  // Ref to track if UPI was viewed in current session
  const upiViewedInSession = useRef(false);

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  // Update canEditDelete when task or bids change
  useEffect(() => {
    if (task && taskBids) {
      const canEdit = checkCanEditDelete(task, taskBids);
      setCanEditDelete(canEdit);
    }
  }, [task, taskBids]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate task ID
      if (!id) {
        console.error('No task ID provided');
        setError('No task ID provided. Please check the URL.');
        return;
      }
      
      const taskIdNumber = Number(id);
      if (isNaN(taskIdNumber) || taskIdNumber <= 0) {
        console.error('Invalid task ID format:', id);
        setError(`Invalid task ID format: ${id}. Please check the URL.`);
        return;
      }
      
      console.log('Fetching task details for ID:', id);
      
      const response = await apiService.tasks.getById(id);
      console.log('Task details response:', response);
      
      if (response && response.data) {
        console.log('Task data received:', response.data);
        console.log('Completion deadline:', response.data.completionDeadline);
        console.log('Bidding deadline:', response.data.biddingDeadline);
        setTask(response.data);
        
        // Fetch bids for this task to check if editing/deleting is allowed
        await fetchTaskBids();
        
        // If task is assigned/in progress, fetch accepted bid details
        if (response.data.status === 'IN_PROGRESS' || response.data.status === 'ASSIGNED') {
          await fetchAcceptedBidDetails();
        }
      } else {
        console.error('No task data received:', response);
        setError('Task not found. It may have been deleted or you may not have permission to view it.');
      }
      
    } catch (error) {
      console.error('Error fetching task details:', error);
      
      // More specific error handling
      if (error.response?.status === 404) {
        setError('Task not found. It may have been deleted or you may not have permission to view it.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this task.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(`Failed to load task details: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskBids = async () => {
    try {
      const response = await apiService.bids.getByTask(id);
      setTaskBids(response.data || []);
    } catch (error) {
      console.error('Error fetching task bids:', error);
      setTaskBids([]);
    }
  };

  // Helper function to check if bidding deadline has passed
  const isBiddingDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // Helper function to check if task can be edited or deleted
  const checkCanEditDelete = (task, bids) => {
    // If task is not OPEN, cannot edit/delete
    if (task.status !== 'OPEN') {
      return false;
    }
    
    // If bidding deadline has not passed, cannot edit/delete (regardless of bids)
    if (!isBiddingDeadlinePassed(task.biddingDeadline)) {
      return false;
    }
    
    // If bidding deadline has passed, check if task has bids
    // If task has bids after deadline, cannot edit/delete permanently
    if (bids.length > 0) {
      return false;
    }
    
    // If no bids after deadline, can edit/delete
    return true;
  };

  const fetchAcceptedBidDetails = async () => {
    try {
      console.log('Fetching accepted bid details for task:', id);
      
      // Check if there's an accepted bid with UPI ID
      const [upiResponse, bidResponse, upiSubmittedResponse, upiViewedResponse] = await Promise.all([
        apiService.bids.getAcceptedBidWithUpi(id).catch(() => null),
        apiService.bids.getAcceptedBid(id).catch(() => null),
        apiService.bids.hasUpiSubmitted(id).catch(() => ({ data: { hasUpiIdSubmitted: false } })),
        apiService.bids.hasUpiViewed(id).catch(() => ({ data: { hasUpiIdViewed: false } }))
      ]);

      console.log('API responses:', {
        upiResponse: upiResponse?.data,
        bidResponse: bidResponse?.data,
        upiSubmittedResponse: upiSubmittedResponse.data,
        upiViewedResponse: upiViewedResponse.data,
        upiViewedInSession: upiViewedInSession.current
      });

      if (upiResponse?.data) {
        setAcceptedBid(upiResponse.data);
      } else if (bidResponse?.data) {
        setAcceptedBid(bidResponse.data);
      }

      setHasUpiSubmitted(upiSubmittedResponse.data.hasUpiIdSubmitted);
      
      // Only update hasUpiViewed if it's not already viewed in current session
      // This prevents overwriting the state when user has just viewed UPI ID
      if (!upiViewedInSession.current) {
        console.log('Setting hasUpiViewed from API:', upiViewedResponse.data.hasUpiIdViewed);
        setHasUpiViewed(upiViewedResponse.data.hasUpiIdViewed);
      } else {
        // If viewed in current session, ensure state is true
        console.log('UPI viewed in session, setting hasUpiViewed to true');
        setHasUpiViewed(true);
      }
      
    } catch (error) {
      console.error('Error fetching accepted bid details:', error);
    }
  };

  const handleEditTask = () => {
    navigate(`${ROUTES.EDIT_TASK.replace(':id', id)}`);
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        setDeleting(true);
        setError(null);
        await apiService.tasks.delete(id);
        navigate(ROUTES.MY_TASKS);
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
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewUpiId = async () => {
    if (!acceptedBid) return;

    try {
      setLoadingUpi(true);
      setUpiError('');

      console.log('Viewing UPI ID for bid:', acceptedBid.id);
      const response = await apiService.bids.viewUpiId(acceptedBid.id);
      
      if (response.data) {
        console.log('UPI ID viewed successfully, updating state');
        setUpiDialogOpen(true);
        setHasUpiViewed(true);
        upiViewedInSession.current = true; // Mark as viewed in current session
        // Update the accepted bid with the viewed status
        setAcceptedBid(prev => ({ ...prev, upiIdViewed: true, upiIdViewedAt: response.data.upiIdViewedAt }));
        
        console.log('State updated - hasUpiViewed:', true, 'upiViewedInSession:', upiViewedInSession.current);
      }
    } catch (error) {
      console.error('Error viewing UPI ID:', error);
      setUpiError(error.response?.data?.message || 'Failed to view UPI ID. Please try again.');
    } finally {
      setLoadingUpi(false);
    }
  };

  const handleAcceptWork = () => {
    setAcceptWorkDialogOpen(true);
  };

  const handleConfirmAcceptWork = async () => {
    if (!acceptedBid) return;

    try {
      setAcceptingWork(true);
      setUpiError('');

      const response = await apiService.bids.acceptWork(acceptedBid.id);
      
      if (response.data) {
        // Update task status to completed
        setTask(prev => ({ ...prev, status: 'COMPLETED' }));
        setAcceptWorkDialogOpen(false);
        
        // Show success toast notification
        dispatch(showEmailSuccessToast('work_accepted'));
        
        // Refresh task details to get updated status
        await fetchTaskDetails();
      }
    } catch (error) {
      console.error('Error accepting work:', error);
      setUpiError(error.response?.data?.message || 'Failed to accept work. Please try again.');
      
      // Show error toast notification
      dispatch(showEmailErrorToast('work_accepted'));
    } finally {
      setAcceptingWork(false);
    }
  };

  const handleCloseUpiDialog = () => {
    setUpiDialogOpen(false);
    setUpiError('');
    setUpiCopied(false); // Reset copy status when dialog closes
  };

  const handleCopyUpiId = async () => {
    if (acceptedBid?.upiId) {
      try {
        await navigator.clipboard.writeText(acceptedBid.upiId);
        setUpiCopied(true);
        // Reset the copied status after 2 seconds
        setTimeout(() => setUpiCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy UPI ID:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = acceptedBid.upiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setUpiCopied(true);
        setTimeout(() => setUpiCopied(false), 2000);
      }
    }
  };

  const handleCloseAcceptWorkDialog = () => {
    setAcceptWorkDialogOpen(false);
    setUpiError('');
  };

  const canViewUpiId = () => {
    return isOwner && 
           acceptedBid && 
           hasUpiSubmitted && 
           !isDeadlineExpired(task?.completionDeadline);
  };

  const canAcceptWork = () => {
    const canAccept = isOwner && 
           acceptedBid && 
           hasUpiSubmitted && 
           (hasUpiViewed || upiViewedInSession.current) && 
           !isDeadlineExpired(task?.completionDeadline);
    
    // Debug logging
    console.log('canAcceptWork check:', {
      isOwner,
      hasAcceptedBid: !!acceptedBid,
      hasUpiSubmitted,
      hasUpiViewed,
      upiViewedInSession: upiViewedInSession.current,
      isDeadlineExpired: isDeadlineExpired(task?.completionDeadline),
      canAccept
    });
    
    return canAccept;
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
      month: 'long',
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

  const isOwner = user?.email === task?.ownerEmail;

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

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={handleGoBack}>
            Go Back
          </Button>
        </Container>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Task not found.
          </Alert>
          <Button variant="contained" onClick={handleGoBack}>
            Go Back
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
        Task Details
      </Typography>
          </Box>
          
          {/* Action Buttons */}
          {isOwner && (
            <Box sx={{ mb: 2 }}>
              {/* Warning message for tasks with active bidding */}
              {task.status === 'OPEN' && !isBiddingDeadlinePassed(task.biddingDeadline) && (
                <Alert 
                  severity="info" 
                  sx={{ mb: 2 }}
                  icon={<Info />}
                >
                  <Typography variant="body2">
                    <strong>Note:</strong> Edit and delete options are disabled during the bidding period. 
                    Once bidding ends, you can edit/delete this task if it received no bids.
                  </Typography>
                </Alert>
              )}
              
              <Box display="flex" gap={2}>
                {/* Edit and Delete buttons for open tasks - Hide for zero-bid tasks */}
                {task.status === 'OPEN' && taskBids.length > 0 && (
                <>
                  <Tooltip 
                    title={
                      canEditDelete 
                        ? "Edit Task" 
                        : !isBiddingDeadlinePassed(task.biddingDeadline)
                          ? "Cannot edit during bidding period"
                          : taskBids.length > 0
                            ? "Cannot edit - task received bids during bidding period"
                            : "Cannot edit - task restrictions apply"
                    }
                    arrow
                  >
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={handleEditTask}
                        color="warning"
                        disabled={!canEditDelete}
                      >
                        Edit Task
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip 
                    title={
                      canEditDelete 
                        ? "Delete Task" 
                        : !isBiddingDeadlinePassed(task.biddingDeadline)
                          ? "Cannot delete during bidding period"
                          : taskBids.length > 0
                            ? "Cannot delete - task received bids during bidding period"
                            : "Cannot delete - task restrictions apply"
                    }
                    arrow
                  >
                    <span>
                      <Button
                        variant="contained"
                        startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
                        onClick={handleDeleteTask}
                        color="error"
                        disabled={deleting || !canEditDelete}
                      >
                        {deleting ? 'Deleting...' : 'Delete Task'}
                      </Button>
                    </span>
                  </Tooltip>
                </>
              )}
              </Box>
              
              {/* UPI ID and Work Acceptance buttons for assigned/in-progress tasks */}
              {(task.status === 'IN_PROGRESS' || task.status === 'ASSIGNED') && (
                <>
                  {/* View UPI ID Button */}
                  {canViewUpiId() && (
                    <Button
                      variant="contained"
                      startIcon={loadingUpi ? <CircularProgress size={20} /> : <Visibility />}
                      onClick={handleViewUpiId}
                      color="info"
                      disabled={loadingUpi}
                      sx={{
                        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        }
                      }}
                    >
                      {loadingUpi ? 'Loading...' : 'View UPI ID'}
                    </Button>
                  )}
                  
                  {/* Accept Work Button */}
                  {canAcceptWork() && (
                    <Button
                      variant="contained"
                      startIcon={acceptingWork ? <CircularProgress size={20} /> : <TaskAlt />}
                      onClick={handleAcceptWork}
                      color="success"
                      disabled={acceptingWork}
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                        }
                      }}
                    >
                      {acceptingWork ? 'Accepting...' : 'Accept Work'}
                    </Button>
                  )}
                  
                  {/* Status indicators */}
                  {hasUpiSubmitted && (
                    <Chip
                      icon={<Payment />}
                      label="UPI ID Submitted"
                      color="info"
                      variant="outlined"
                    />
                  )}
                  
                  {hasUpiViewed && (
                    <Chip
                      icon={<Visibility />}
                      label="UPI ID Viewed"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  
                  {isDeadlineExpired(task.completionDeadline) && (
                    <Chip
                      icon={<Schedule />}
                      label="Deadline Expired"
                      color="error"
                      variant="outlined"
                    />
                  )}
                  
                  {!isDeadlineExpired(task.completionDeadline) && getDeadlineWarning(task.completionDeadline) && (
                    <Chip
                      icon={<Schedule />}
                      label="Deadline Soon"
                      color={getDeadlineStatusColor(task.completionDeadline)}
                      variant="outlined"
                    />
                  )}
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Task Information */}
        <Grid container spacing={3}>
          {/* Main Task Details */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              {/* Task Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {task.title}
                </Typography>
                <Chip
                  label={task.status}
                  color={getStatusColor(task.status)}
                  size="large"
                  sx={{ ml: 2 }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Warning message if task cannot be edited/deleted */}
              {isOwner && task.status === 'OPEN' && !canEditDelete && taskBids.length > 0 && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  action={
                    <Typography variant="body2" color="text.secondary">
                      {taskBids.length} bid{taskBids.length !== 1 ? 's' : ''} placed
                    </Typography>
                  }
                >
                  This task cannot be edited or deleted because bids have been placed. You can only edit or delete tasks that have no bids.
                </Alert>
              )}

              {/* Task Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 1 }} />
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {task.description}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Task Details Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Category sx={{ mr: 1 }} />
                        Category
                      </Typography>
                      <Typography variant="body1">
                        {CATEGORY_LABELS[task.category] || task.category}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1 }} />
                        Budget
                      </Typography>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(task.budget)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {task.completionDeadline && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule sx={{ mr: 1 }} />
                          Deadline
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {formatDate(task.completionDeadline)}
                        </Typography>
                        
                        {/* Live Countdown Timer - Only show if task is not completed */}
                        {task.status !== 'COMPLETED' && (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                              Time Remaining:
                            </Typography>
                            <CountdownTimer 
                              deadline={task.completionDeadline}
                              variant="default"
                              size="medium"
                            />
                          </Box>
                        )}
                        
                        {/* Show completion message if task is completed */}
                        {task.status === 'COMPLETED' && (
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                            borderRadius: 1,
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            textAlign: 'center'
                          }}>
                            <TaskAlt sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                              Task Completed!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              This task has been successfully completed.
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {/* Bidding Deadline Card - for OPEN tasks */}
                {task.status === 'OPEN' && task.biddingDeadline && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ borderColor: 'primary.main' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                          <Schedule sx={{ mr: 1 }} />
                          Bidding Ends
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {formatDate(task.biddingDeadline)}
                        </Typography>
                        
                        {/* Live Countdown Timer for Bidding Deadline */}
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Bidding Time Remaining:
                          </Typography>
                          <CountdownTimer 
                            deadline={task.biddingDeadline}
                            variant="default"
                            size="medium"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        Created By
                      </Typography>
                      <Typography variant="body1">
                        {task.ownerEmail}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Task Timestamps */}
                {task.acceptedAt && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ borderColor: 'success.main' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                          <TaskAlt sx={{ mr: 1 }} />
                          Accepted At
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {formatDate(task.acceptedAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {task.completedAt && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined" sx={{ borderColor: 'primary.main' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                          <Assignment sx={{ mr: 1 }} />
                          Completed At
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {formatDate(task.completedAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* UPI ID Viewing Dialog */}
        <Dialog open={upiDialogOpen} onClose={handleCloseUpiDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <Payment color="primary" />
              Bidder's UPI ID
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              The bidder has submitted their UPI ID for payment. You can now make the payment externally using this UPI ID.
            </DialogContentText>
            
            {acceptedBid && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.05)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Payment Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Bidder:</strong> {acceptedBid.bidderEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> {formatCurrency(acceptedBid.amount)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                  <strong>UPI ID:</strong>
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    backgroundColor: 'rgba(33, 150, 243, 0.1)', 
                    p: 1, 
                    borderRadius: 1,
                    border: '1px solid rgba(33, 150, 243, 0.2)'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'monospace',
                      flex: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {acceptedBid.upiId}
                  </Typography>
                  <Tooltip title={upiCopied ? "Copied!" : "Copy UPI ID"}>
                    <IconButton
                      size="small"
                      onClick={handleCopyUpiId}
                      color={upiCopied ? "success" : "primary"}
                      sx={{ 
                        minWidth: 'auto',
                        '&:hover': {
                          backgroundColor: upiCopied ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)'
                        }
                      }}
                    >
                      {upiCopied ? <Check /> : <ContentCopy />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> After making the payment, you can click "Accept Work" to mark the task as completed. 
                Make sure to verify the UPI ID and amount before making the payment.
              </Typography>
            </Alert>
            
            {task?.completionDeadline && getDeadlineWarning(task.completionDeadline) && (
              <Alert severity={getDeadlineStatusColor(task.completionDeadline)} sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Deadline Alert:</strong> {getDeadlineWarning(task.completionDeadline)}
                </Typography>
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseUpiDialog}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Accept Work Confirmation Dialog */}
        <Dialog open={acceptWorkDialogOpen} onClose={handleCloseAcceptWorkDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <TaskAlt color="success" />
              Accept Completed Work
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Are you sure you want to accept this work as completed? This will mark the task as completed and finalize the payment process.
            </DialogContentText>
            
            {acceptedBid && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Work Details:
                </Typography>
                <Typography variant="body2">
                  <strong>Bidder:</strong> {acceptedBid.bidderEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> {formatCurrency(acceptedBid.amount)}
                </Typography>
                <Typography variant="body2">
                  <strong>UPI ID:</strong> {acceptedBid.upiId}
                </Typography>
                <Typography variant="body2">
                  <strong>UPI ID Viewed:</strong> {hasUpiViewed ? 'Yes' : 'No'}
                </Typography>
              </Box>
            )}
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Make sure you have made the payment to the bidder's UPI ID before accepting the work. 
                This action cannot be undone.
              </Typography>
            </Alert>
            
            {upiError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {upiError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseAcceptWorkDialog} disabled={acceptingWork}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAcceptWork}
              variant="contained"
              color="success"
              disabled={acceptingWork}
              startIcon={acceptingWork ? <CircularProgress size={20} /> : <TaskAlt />}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                }
              }}
            >
              {acceptingWork ? 'Accepting...' : 'Accept Work'}
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
    </Layout>
  );
};

export default TaskDetailPage;
