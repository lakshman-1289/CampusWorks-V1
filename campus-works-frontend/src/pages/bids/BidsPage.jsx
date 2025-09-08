import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Gavel,
  Assignment,
  ArrowBack
} from '@mui/icons-material';
import Layout from '@components/templates/Layout';
import BidCard from '@components/molecules/BidCard';
import { selectAuth } from '@store/slices/authSlice';
import { ROUTES } from '@constants';
import apiService from '@services/api';

const BidsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  
  const [tasks, setTasks] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchUserTasksAndBids();
    }
  }, [user?.email]);

  const fetchUserTasksAndBids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tasks owned by the current user
      const tasksResponse = await apiService.tasks.getByOwnerEmail(user.email);
      const userTasks = tasksResponse.data || [];
      setTasks(userTasks);
      
      // Fetch all bids for these tasks
      if (userTasks.length > 0) {
        const allBids = [];
        for (const task of userTasks) {
          try {
            const bidsResponse = await apiService.bids.getByTask(task.id);
            const taskBids = (bidsResponse.data || []).map(bid => ({
              ...bid,
              taskTitle: task.title,
              taskBudget: task.budget,
              taskStatus: task.status,
              taskBiddingDeadline: task.biddingDeadline,
              taskCompletionDeadline: task.completionDeadline
            }));
            allBids.push(...taskBids);
          } catch (error) {
            console.error(`Error fetching bids for task ${task.id}:`, error);
          }
        }
        setBids(allBids);
      }
      
    } catch (error) {
      console.error('Error fetching user tasks and bids:', error);
      setError('Failed to load bids. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (taskId) => {
    navigate(`${ROUTES.TASK_DETAIL.replace(':id', taskId)}`);
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                borderColor: '#90caf9',
                color: '#1976d2',
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
              Bids on My Tasks
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            View and manage bids placed on your tasks
          </Typography>
        </Box>

        {bids.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Gavel sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Bids Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't received any bids on your tasks yet. Create more tasks to attract bidders!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Assignment />}
              onClick={() => navigate(ROUTES.CREATE_TASK)}
            >
              Create New Task
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
                <BidCard
                  key={bid.id}
                  bid={bid}
                  variant="compact"
                  onView={handleViewTask}
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
      </Container>
    </Layout>
  );
};

export default BidsPage;
