import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Paper, Grid, Button, Box, Chip } from '@mui/material';
import { Add, Assignment, Gavel, TrendingUp, AssignmentTurnedIn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '@components/templates/Layout';
import { selectAuth } from '@store/slices/authSlice';
import { ROUTES } from '@constants';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const quickActions = [
    {
      title: 'Create New Task',
      description: 'Post a new academic task for others to bid on',
      icon: <Add />,
      action: () => navigate(ROUTES.CREATE_TASK),
      color: 'primary'
    },
    {
      title: 'My Tasks',
      description: 'View and manage your created tasks',
      icon: <AssignmentTurnedIn />,
      action: () => navigate(ROUTES.MY_TASKS),
      color: 'warning'
    },
    {
      title: 'Browse Tasks',
      description: 'Find tasks to bid on and earn money',
      icon: <Assignment />,
      action: () => navigate(ROUTES.TASKS),
      color: 'secondary'
    },
    {
      title: 'My Bids',
      description: 'Check the status of your bids',
      icon: <Gavel />,
      action: () => navigate(ROUTES.MY_BIDS),
      color: 'info'
    },
  ];

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.email?.split('@')[0] || 'Student'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your peer-to-peer academic task platform dashboard
          </Typography>
          <Chip 
            label={`Role: ${user?.role || 'STUDENT'}`} 
            color="primary" 
            variant="outlined" 
            icon={<TrendingUp />}
            sx={{
              borderColor: '#31258E', // Light blue border
              color: '#31258E', // Light blue text
              backgroundColor: 'rgba(49, 37, 142, 0.05)', // Very light blue background
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: '#4A3A9E',
                color: '#4A3A9E',
                backgroundColor: 'rgba(49, 37, 142, 0.1)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 25px rgba(49, 37, 142, 0.3), 0 0 0 3px rgba(49, 37, 142, 0.15)',
                '&::before': {
                  transform: 'scale(1)',
                  opacity: 1
                },
                '& .MuiChip-icon': {
                  transform: 'rotate(360deg)',
                  transition: 'transform 0.6s ease',
                  color: '#4A3A9E'
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
                background: 'radial-gradient(circle, rgba(49, 37, 142, 0.15) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%) scale(0)',
                transition: 'all 0.6s ease',
                opacity: 0,
                zIndex: 0
              },
              '& .MuiChip-icon': {
                position: 'relative',
                zIndex: 1,
                transition: 'transform 0.3s ease'
              }
            }}
          />
        </Box>

        {/* Quick Actions */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',

                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover, &:active, &:focus': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(230, 135, 231, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(230, 135, 231, 0.6)',
                    background: 'rgba(255, 255, 255, 1)',
                    '& .card-header': {
                      background: 'linear-gradient(135deg, rgba(230, 135, 231, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%)',
                    },
                    '& .card-content': {
                      background: 'rgba(230, 135, 231, 0.02)',
                    }
                  },
                  // Touch device specific styles
                  '@media (hover: none) and (pointer: coarse)': {
                    '&:active': {
                      transform: 'translateY(-4px) scale(1.01)',
                      boxShadow: '0 12px 24px rgba(230, 135, 231, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
                      border: '2px solid rgba(230, 135, 231, 0.8)',
                      background: 'rgba(255, 255, 255, 1)',
                      '& .card-header': {
                        background: 'linear-gradient(135deg, rgba(230, 135, 231, 0.08) 0%, rgba(186, 104, 200, 0.08) 100%)',
                      },
                      '& .card-content': {
                        background: 'rgba(230, 135, 231, 0.03)',
                      }
                    }
                  }
                }}
                onClick={action.action}
              >
                <Box className="card-header" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: `${action.color}.light`,
                      color: `${action.color}.contrastText`,
                      mr: 2
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {action.title}
                  </Typography>
                </Box>
                <Typography className="card-content" variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {action.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  color={action.color}
                  size="small"
                  sx={{ 
                    mt: 2, 
                    alignSelf: 'flex-start',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                      '&::before': {
                        transform: 'scale(1)',
                        opacity: 1
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
                      background: 'radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%)',
                      transform: 'translate(-50%, -50%) scale(0)',
                      transition: 'all 0.4s ease',
                      opacity: 0,
                      zIndex: 0
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>Go</span>
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Stats Overview */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover, &:active, &:focus': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(230, 135, 231, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
                  border: '2px solid rgba(230, 135, 231, 0.6)',
                  background: 'rgba(255, 255, 255, 1)',
                  '& .card-header': {
                    background: 'linear-gradient(135deg, rgba(230, 135, 231, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%)',
                  },
                  '& .card-content': {
                    background: 'rgba(230, 135, 231, 0.02)',
                  }
                },
                // Touch device specific styles
                '@media (hover: none) and (pointer: coarse)': {
                  '&:active': {
                    transform: 'translateY(-4px) scale(1.01)',
                    boxShadow: '0 12px 24px rgba(230, 135, 231, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)',
                    border: '2px solid rgba(230, 135, 231, 0.8)',
                    background: 'rgba(255, 255, 255, 1)',
                    '& .card-header': {
                      background: 'linear-gradient(135deg, rgba(230, 135, 231, 0.08) 0%, rgba(186, 104, 200, 0.08) 100%)',
                    },
                    '& .card-content': {
                      background: 'rgba(230, 135, 231, 0.03)',
                    }
                  }
                }
              }}
            >
              <Typography className="card-header" variant="h6" gutterBottom color="primary">
                🎯 Getting Started
              </Typography>
              <Typography className="card-content" variant="body1" paragraph>
                Welcome to CampusWorks! Here you can:
              </Typography>
              <Box className="card-content" component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Post academic tasks and get help from fellow students
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Bid on tasks to earn money using your skills
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Build your reputation through quality work
                </Typography>
                <Typography component="li" variant="body2">
                  Manage payments securely through UPI id
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
        </Grid>
      </Container>
    </Layout>
  );
};

export default DashboardPage;


