import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Stack,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Assignment,
  Visibility,
  Gavel,
  Schedule,
  AttachMoney,
  Category,
  Person,
  FilterList,
  Refresh,
  ExpandMore,
  Clear,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowBack
} from '@mui/icons-material';
import Layout from '@components/templates/Layout';
import TaskCard from '@components/molecules/TaskCard';
import { selectAuth } from '@store/slices/authSlice';
import { ROUTES, CATEGORY_LABELS, TASK_CATEGORIES, TASK_STATUS, STATUS_LABELS } from '@constants';
import apiService from '@services/api';

const TasksPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [taskBidCounts, setTaskBidCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showMyBidsOnly, setShowMyBidsOnly] = useState(false);

  useEffect(() => {
    fetchAllTasks();
  }, [user?.email]);

  // Fetch user bids after tasks are loaded
  useEffect(() => {
    if (user?.email && tasks.length > 0) {
      fetchUserBids();
    }
  }, [user?.email, tasks]);

  useEffect(() => {
    filterTasks();
  }, [tasks, categoryFilter, searchQuery, budgetRange, sortBy, sortOrder, showMyBidsOnly]);

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.tasks.getAll();
      const tasksData = response.data || [];
      setTasks(tasksData);
      
      // Fetch bid counts for all tasks
      if (tasksData.length > 0) {
        const taskIds = tasksData.map(task => task.id);
        await fetchTaskBidCounts(taskIds, tasksData);
      }
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBids = async () => {
    try {
      const response = await apiService.bids.getByUserEmail(user.email);
      const allBids = response.data || [];
      
      // Filter out bids on tasks owned by the current user
      // Task owners cannot bid on their own tasks, so these bids should be excluded
      const validBids = allBids.filter(bid => {
        // Find the task for this bid
        const task = tasks.find(t => t.id === bid.taskId);
        // Only include bids on tasks not owned by the current user
        return task && task.ownerEmail !== user.email;
      });
      
      setUserBids(validBids);
    } catch (error) {
      console.error('Error fetching user bids:', error);
      // Don't show error for bids as it's not critical for the main functionality
    }
  };

  const fetchTaskBidCounts = async (taskIds, tasksData = null) => {
    try {
      // Use passed tasksData or fallback to state
      const tasksToUse = tasksData || tasks;
      
      const bidCountPromises = taskIds.map(async (taskId) => {
        try {
          const response = await apiService.bids.getByTask(taskId);
          const allBids = response.data || [];
          
          // Find the task to get the owner email
          const task = tasksToUse.find(t => t.id === taskId);
          if (!task) {
            return { taskId, count: 0 };
          }
          
          // Filter out bids from the task owner
          const validBids = allBids.filter(bid => bid.bidderEmail !== task.ownerEmail);
          
          return { taskId, count: validBids.length };
        } catch (error) {
          console.error(`Error fetching bids for task ${taskId}:`, error);
          return { taskId, count: 0 };
        }
      });

      const bidCounts = await Promise.all(bidCountPromises);
      const bidCountMap = {};
      bidCounts.forEach(({ taskId, count }) => {
        bidCountMap[taskId] = count;
      });
      setTaskBidCounts(bidCountMap);
    } catch (error) {
      console.error('Error fetching task bid counts:', error);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // ALWAYS filter for OPEN tasks only (available for bidding)
    filtered = filtered.filter(task => task.status === 'OPEN');

    // ALWAYS filter out expired tasks (bidding deadline passed)
    filtered = filtered.filter(task => {
      const timeRemaining = getTimeRemaining(task.biddingDeadline);
      return !timeRemaining.expired;
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.ownerEmail.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Filter by budget range
    filtered = filtered.filter(task => 
      task.budget >= budgetRange[0] && task.budget <= budgetRange[1]
    );

    // Filter by my bids only
    if (showMyBidsOnly && user?.email) {
      filtered = filtered.filter(task => hasUserBidOnTask(task.id));
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'budget':
          aValue = a.budget;
          bValue = b.budget;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'biddingDeadline':
          aValue = new Date(a.biddingDeadline);
          bValue = new Date(b.biddingDeadline);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleViewTask = (taskId) => {
    navigate(`${ROUTES.TASK_DETAIL.replace(':id', taskId)}`);
  };

  const handlePlaceBid = (task) => {
    setSelectedTask(task);
    setBidAmount('');
    setBidProposal('');
    setBidDialogOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || !bidProposal.trim()) {
      setError('Please fill in both bid amount and proposal.');
      return;
    }

    const bidAmountNum = parseFloat(bidAmount);
    if (bidAmountNum < 50 || bidAmountNum > 10000) {
      setError('Bid amount must be between ₹50 and ₹10,000.');
      return;
    }

    if (bidAmountNum > selectedTask.budget) {
      setError(`Your bid amount (${formatCurrency(bidAmountNum)}) cannot exceed the task budget (${formatCurrency(selectedTask.budget)}).`);
      return;
    }

    try {
      setPlacingBid(true);
      setError(null);

      const bidData = {
        taskId: selectedTask.id,
        amount: bidAmountNum,
        proposal: bidProposal.trim()
      };

      await apiService.bids.placeBid(bidData);
      
      setBidDialogOpen(false);
      setSelectedTask(null);
      setBidAmount('');
      setBidProposal('');
      
      // Refresh tasks and user bids
      fetchAllTasks();
      fetchUserBids();
      
    } catch (error) {
      console.error('Error placing bid:', error);
      setError('Failed to place bid. Please try again.');
    } finally {
      setPlacingBid(false);
    }
  };

  const handleCloseBidDialog = () => {
    setBidDialogOpen(false);
    setSelectedTask(null);
    setBidAmount('');
    setBidProposal('');
    setError(null);
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

  const hasUserBidOnTask = (taskId) => {
    return userBids.some(bid => bid.taskId === taskId);
  };

  const canPlaceBid = (task) => {
    // Check if user is the task owner
    if (user?.email === task.ownerEmail) {
      return false;
    }

    // Check if user has already placed a bid on this task
    if (hasUserBidOnTask(task.id)) {
      return false;
    }

    // Check if task is open
    if (task.status !== 'OPEN') {
      return false;
    }

    // Check if bidding deadline has passed
    const timeRemaining = getTimeRemaining(task.biddingDeadline);
    if (timeRemaining.expired) {
      return false;
    }

    return true;
  };

  const clearAllFilters = () => {
    setCategoryFilter('');
    setSearchQuery('');
    setBudgetRange([0, 10000]);
    setSortBy('createdAt');
    setSortOrder('desc');
    setShowMyBidsOnly(false);
  };

  const getBudgetRange = () => {
    if (tasks.length === 0) return [0, 10000];
    const budgets = tasks.map(task => task.budget);
    return [Math.min(...budgets), Math.max(...budgets)];
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (categoryFilter) count++;
    if (searchQuery.trim()) count++;
    if (budgetRange[0] > 0 || budgetRange[1] < 10000) count++;
    if (showMyBidsOnly) count++;
    return count;
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'transparent',
      py: 4,
      px: 2,
      '@keyframes spin': {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },
    }}>
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                borderColor: '#90caf9', // Light blue border
                color: '#1976d2', // Blue text
                backgroundColor: 'transparent',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateX(-4px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3), 0 0 0 3px rgba(25, 118, 210, 0.15), inset 0 0 0 1px rgba(25, 118, 210, 0.2)',
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
                  background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.12), rgba(25, 118, 210, 0.06))',
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
              Browse Tasks
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Browse active tasks available for bidding and earn money
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAllTasks}
              sx={{
                borderColor: '#90caf9', // Light blue border
                color: '#1976d2', // Blue text
                backgroundColor: 'transparent',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateY(-2px) scale(1.08)',
                  boxShadow: '0 12px 30px rgba(25, 118, 210, 0.3), 0 0 0 3px rgba(25, 118, 210, 0.15), inset 0 0 0 1px rgba(25, 118, 210, 0.2)',
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
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filter Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search tasks by title, description, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Primary Filter Dropdowns - Category and Status */}
          <Box sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Quick Filters
              </Typography>
              {categoryFilter && (
                <Chip
                  label="1 Active"
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing only OPEN tasks available for bidding. Use filters below to customize your view.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {/* Category Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="category-filter-label">
                    <Box display="flex" alignItems="center">
                      <Category sx={{ mr: 1, fontSize: 20 }} />
                      Category
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={categoryFilter}
                    label={
                      <Box display="flex" alignItems="center">
                        <Category sx={{ mr: 1, fontSize: 20 }} />
                        Category
                      </Box>
                    }
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                    renderValue={(value) => (
                      <Box display="flex" alignItems="center">
                        <Category sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                        {value ? CATEGORY_LABELS[value] : 'All Categories'}
                      </Box>
                    )}
                  >
                    <MenuItem value="">
                      <em>All Categories</em>
                    </MenuItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Category sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          {label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-filter-label">
                    <Box display="flex" alignItems="center">
                      <Assignment sx={{ mr: 1, fontSize: 20 }} />
                      Status
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label={
                      <Box display="flex" alignItems="center">
                        <Assignment sx={{ mr: 1, fontSize: 20 }} />
                        Status
                      </Box>
                    }
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                    renderValue={(value) => (
                      <Box display="flex" alignItems="center">
                        {value ? (
                          <>
                            <Chip
                              label={value}
                              size="small"
                              color={getStatusColor(value)}
                              sx={{ mr: 1, minWidth: 60 }}
                            />
                            {STATUS_LABELS.TASK_STATUS[value]}
                          </>
                        ) : (
                          <>
                            <Assignment sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            All Statuses
                          </>
                        )}
                      </Box>
                    )}
                  >
                    <MenuItem value="">
                      <em>All Statuses</em>
                    </MenuItem>
                    {Object.entries(STATUS_LABELS.TASK_STATUS).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Chip
                            label={key}
                            size="small"
                            color={getStatusColor(key)}
                            sx={{ mr: 1, minWidth: 60 }}
                          />
                          {label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}

              {/* Clear Filters Button */}
              <Grid item xs={12} sm={12} md={4}>
                <Box display="flex" alignItems="center" height="100%">
                  {categoryFilter && (
                    <Button
                      variant="outlined"
                      startIcon={<Clear />}
                      onClick={() => {
                        setCategoryFilter('');
                      }}
                      color="secondary"
                      fullWidth
                      sx={{ 
                        height: 56,
                        borderColor: '#90caf9', // Light blue border
                        color: '#1976d2', // Blue text
                        backgroundColor: 'transparent',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: '#1976d2',
                          color: '#1976d2',
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          transform: 'translateY(-2px) scale(1.05)',
                          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3), 0 0 0 3px rgba(25, 118, 210, 0.15)',
                          '&::before': {
                            transform: 'scale(1)',
                            opacity: 1
                          },
                          '& .MuiButton-startIcon': {
                            transform: 'rotate(180deg)',
                            transition: 'transform 0.6s ease',
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
                      Clear Filters
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Advanced Filters Toggle */}
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Button
              variant="text"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              endIcon={getActiveFiltersCount() > 0 && (
                <Chip 
                  label={getActiveFiltersCount()} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              )}
              sx={{ 
                textTransform: 'none',
                color: '#1976d2', // Blue text
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.2)',
                  '&::before': {
                    transform: 'scale(1)',
                    opacity: 1
                  },
                  '& .MuiButton-startIcon': {
                    transform: 'rotate(180deg)',
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
                  background: 'radial-gradient(circle, rgba(25, 118, 210, 0.15) 0%, transparent 70%)',
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
              {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </Button>
            
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="text"
                startIcon={<Clear />}
                onClick={clearAllFilters}
                color="secondary"
                sx={{ 
                  textTransform: 'none',
                  color: '#1976d2', // Blue text
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.2)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    },
                    '& .MuiButton-startIcon': {
                      transform: 'rotate(180deg)',
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
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.15) 0%, transparent 70%)',
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
                Clear All Filters
              </Button>
            )}
          </Box>

          {/* Advanced Filters */}
          {showFilters && (
            <Accordion expanded={showFilters} sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                <Typography variant="h6">Advanced Filters</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Grid container spacing={3}>
                  {/* Sort By */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <MenuItem value="createdAt">Created Date</MenuItem>
                        <MenuItem value="title">Title</MenuItem>
                        <MenuItem value="budget">Budget</MenuItem>
                        <MenuItem value="biddingDeadline">Bidding Deadline</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sort Order */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={sortOrder}
                        label="Order"
                        onChange={(e) => setSortOrder(e.target.value)}
                      >
                        <MenuItem value="desc">
                          <Box display="flex" alignItems="center">
                            <TrendingDown sx={{ mr: 1 }} />
                            Descending
                          </Box>
                        </MenuItem>
                        <MenuItem value="asc">
                          <Box display="flex" alignItems="center">
                            <TrendingUp sx={{ mr: 1 }} />
                            Ascending
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* My Bids Filter */}
                  {user?.email && (
                    <Grid item xs={12} sm={12} md={4}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Show Tasks</InputLabel>
                        <Select
                          value={showMyBidsOnly ? 'myBids' : 'all'}
                          label="Show Tasks"
                          onChange={(e) => {
                            const value = e.target.value;
                            setShowMyBidsOnly(value === 'myBids');
                          }}
                        >
                          <MenuItem value="all">All Open Tasks</MenuItem>
                          <MenuItem value="myBids">My Bids Only</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Budget Range */}
                  <Grid item xs={12}>
                    <Box sx={{ px: 2 }}>
                      <Typography gutterBottom>
                        Budget Range: {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
                      </Typography>
                      <Slider
                        value={budgetRange}
                        onChange={(e, newValue) => setBudgetRange(newValue)}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => formatCurrency(value)}
                        min={0}
                        max={Math.max(10000, ...tasks.map(t => t.budget))}
                        step={100}
                        marks={[
                          { value: 0, label: '₹0' },
                          { value: Math.max(10000, ...tasks.map(t => t.budget)), label: formatCurrency(Math.max(10000, ...tasks.map(t => t.budget))) }
                        ]}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {categoryFilter && (
                  <Chip
                    label={`Category: ${CATEGORY_LABELS[categoryFilter]}`}
                    onDelete={() => setCategoryFilter('')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {searchQuery && (
                  <Chip
                    label={`Search: "${searchQuery}"`}
                    onDelete={() => setSearchQuery('')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {(budgetRange[0] > 0 || budgetRange[1] < 10000) && (
                  <Chip
                    label={`Budget: ${formatCurrency(budgetRange[0])} - ${formatCurrency(budgetRange[1])}`}
                    onDelete={() => setBudgetRange([0, 10000])}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {showMyBidsOnly && (
                  <Chip
                    label="My Bids Only"
                    onDelete={() => setShowMyBidsOnly(false)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredTasks.length} open tasks available for bidding
            {getActiveFiltersCount() > 0 && ' (filtered)'}
          </Typography>
        </Box>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Tasks Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {tasks.length === 0 
                ? 'No tasks have been created yet.' 
                : getActiveFiltersCount() > 0 
                  ? 'No open tasks match your current filters. Try adjusting your search criteria.'
                  : 'No open tasks are available for bidding at the moment.'}
            </Typography>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="contained"
                startIcon={<Clear />}
                onClick={clearAllFilters}
                sx={{ 
                  mt: 1,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  color: '#1976d2',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                    color: '#1565c0',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3), 0 0 0 3px rgba(25, 118, 210, 0.15)',
                    '&::before': {
                      transform: 'scale(1)',
                      opacity: 1
                    },
                    '& .MuiButton-startIcon': {
                      transform: 'rotate(180deg)',
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
                    background: 'radial-gradient(circle, rgba(25, 118, 210, 0.15) 0%, transparent 70%)',
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
                Clear All Filters
              </Button>
            )}
          </Paper>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2, 
            maxWidth: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 2,
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
            {filteredTasks.map((task) => {
              const timeRemaining = getTimeRemaining(task.biddingDeadline);
              const canBid = canPlaceBid(task);
              
              return (
                <Box
                  key={task.id}
                  sx={{
                    width: {
                      xs: '100%',
                      sm: '350px',
                      md: '350px'
                    },
                    justifySelf: 'center'
                  }}
                >
                  <TaskCard
                  task={task}
                  variant="compact"
                  showBidCount={true}
                  bidCount={taskBidCounts[task.id] || 0}
                  hasUserBid={hasUserBidOnTask(task.id)}
                  actions={{
                    view: true,
                    bid: canBid && user?.email !== task.ownerEmail
                  }}
                  onView={(task) => handleViewTask(task.id)}
                  onBid={(task) => handlePlaceBid(task)}
                />
                </Box>
              );
            })}
          </Box>
        )}

        {/* Place Bid Dialog */}
        <Dialog open={bidDialogOpen} onClose={handleCloseBidDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Place Bid on "{selectedTask?.title}"
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Bid Amount (₹)"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                sx={{ mb: 3 }}
                placeholder="Enter your bid amount (₹50 - ₹10,000)"
                helperText={`Task Budget: ${selectedTask ? formatCurrency(selectedTask.budget) : ''} | Your bid must be between ₹50 and ₹10,000`}
                inputProps={{ 
                  min: 50, 
                  max: 10000,
                  step: 0.01
                }}
                error={bidAmount && (parseFloat(bidAmount) < 50 || parseFloat(bidAmount) > 10000)}
              />
              
              <TextField
                fullWidth
                label="Proposal"
                multiline
                rows={4}
                value={bidProposal}
                onChange={(e) => setBidProposal(e.target.value)}
                placeholder="Describe how you will complete this task..."
                helperText="Explain your approach and why you're the best fit for this task"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBidDialog} disabled={placingBid}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBid} 
              variant="contained" 
              disabled={placingBid || !bidAmount || !bidProposal.trim()}
              startIcon={placingBid && <CircularProgress size={20} />}
            >
              {placingBid ? 'Placing Bid...' : 'Place Bid'}
            </Button>
          </DialogActions>
        </Dialog>
        </Container>
      </Layout>
    </Box>
  );
};

export default TasksPage;