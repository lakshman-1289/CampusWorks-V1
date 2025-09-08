import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Assignment,
  Gavel,
  Person,
  ExitToApp,
  Menu as MenuIcon
} from '@mui/icons-material';
import { logoutUser, selectAuth, selectAuthLoading } from '@store/slices/authSlice';
import { ROUTES } from '@constants';
import CampusWorksLogo from '../../assets/images/logo_campusworks.png';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, user } = useSelector(selectAuth);
  const isLoading = useSelector(selectAuthLoading);
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
  const open = Boolean(anchorEl);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuClick = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    handleMobileMenuClose();
    
    try {
      await dispatch(logoutUser()).unwrap();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      // Even if logout fails, redirect to login for security
      navigate(ROUTES.LOGIN);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
    handleMobileMenuClose();
  };

  // Don't show navigation on auth pages
  if (!isAuthenticated || location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER) {
    return null;
  }

  const navigationItems = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <Dashboard /> },
    { label: 'Tasks', path: ROUTES.TASKS, icon: <Assignment /> },
    { label: 'Bids', path: ROUTES.BIDS, icon: <Gavel /> },
    { label: 'Profile', path: ROUTES.PROFILE, icon: <Person /> }
  ];

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left Side - Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to={ROUTES.DASHBOARD} style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={CampusWorksLogo}
                alt="CampusWorks Logo"
                sx={{
                  height: { xs: 90, md: 90},
                  width: 'auto',
                  objectFit: 'contain',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  display: 'block',
                  maxWidth: '100%',
                  verticalAlign: 'middle',
                  // Remove any potential box styling
                  boxShadow: 'none',
                  borderRadius: 0,
                  padding: 0,
                  margin: 0,
                  alignSelf: 'center',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: 'inherit',
                  fontWeight: 600,
                  display: 'block',
                  marginLeft: '-20px',
                  zIndex: 1,
                  position: 'relative'
                }}
              >
                ampusWorks
              </Typography>
            </Box>
          </Link>
        </Box>

        {/* Center - Navigation Links (Desktop Only) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              sx={{
                mx: 1,
                color: 'text.primary',
                backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Right Side - Mobile & Desktop Menus */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Mobile Hamburger Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open mobile menu"
              aria-controls={mobileMenuOpen ? 'mobile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={mobileMenuOpen ? 'true' : undefined}
              onClick={handleMobileMenuClick}
              disabled={isLoading}
              sx={{
                color: '#000000',
                '&:hover': {
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="primary" />
              ) : (
                <MenuIcon />
              )}
            </IconButton>
          </Box>

          {/* Desktop User Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.email || 'User'}
            </Typography>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleMenuClick}
              disabled={isLoading}
              sx={{
                color: '#000000',
                '&:hover': {
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="primary" />
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <AccountCircle />
                </Avatar>
              )}
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* Desktop User Menu */}
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info */}
        <MenuItem disabled>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccountCircle />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {user?.email || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role || 'STUDENT'}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />

        {/* Profile Link */}
        <MenuItem onClick={() => handleNavigation(ROUTES.PROFILE)}>
          <Person />
          <Typography sx={{ ml: 1 }}>My Profile</Typography>
        </MenuItem>

        {/* Logout */}
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp />
          <Typography sx={{ ml: 1 }}>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        id="mobile-menu"
        anchorEl={mobileMenuAnchor}
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        onClick={handleMobileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 250,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info */}
        <MenuItem disabled>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccountCircle />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {user?.email || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role || 'STUDENT'}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />

        {/* Navigation Links */}
        {navigationItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            {item.icon}
            <Typography sx={{ ml: 1 }}>{item.label}</Typography>
          </MenuItem>
        ))}

        <Divider />

        {/* Profile Link */}
        <MenuItem onClick={() => handleNavigation(ROUTES.PROFILE)}>
          <Person />
          <Typography sx={{ ml: 1 }}>My Profile</Typography>
        </MenuItem>

        {/* Logout */}
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ExitToApp />
          <Typography sx={{ ml: 1 }}>Logout</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navigation;