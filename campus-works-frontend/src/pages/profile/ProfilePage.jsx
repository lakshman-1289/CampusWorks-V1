import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Delete,
  Edit,
  Security,
  Person,
  Warning,
  Logout,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  ArrowBack
} from '@mui/icons-material';
import Layout from '@components/templates/Layout';
import { selectAuth, logoutUser, updateUser } from '@store/slices/authSlice';
import { ROUTES, AVAILABILITY_STATUS } from '@constants';
import apiService, { apiUtils } from '@services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector(selectAuth);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Change password state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState({});
  const [changePasswordTouched, setChangePasswordTouched] = useState({});
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });


  // Profile edit state
  const [editOpen, setEditOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    major: '',
    academicYear: 'PUC1',
    availabilityStatus: 'AVAILABLE',
    isPublic: true
  });

  const ACADEMIC_YEAR_OPTIONS = ['PUC1', 'PUC2', 'E1', 'E2', 'E3', 'E4'];

  const mapAcademicYearNumberToOption = (num) => {
    switch (num) {
      case 1: return 'PUC1';
      case 2: return 'PUC2';
      case 3: return 'E1';
      case 4: return 'E2';
      case 5: return 'E3';
      case 6: return 'E4';
      default: return 'PUC1';
    }
  };

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError('');

      let res = null;
      // Try to get user ID from token if not available in user object
      const userId = user?.id || apiUtils.getUserIdFromToken();
      
      if (userId) {
        res = await apiService.profiles.getByUser(userId);
      } else if (user?.email) {
        res = await apiService.profiles.getByUserEmail(user.email);
      }

      if (res && res.status === 200 && res.data) {
        const p = res.data;
        setProfileId(p.id);
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          major: p.major || '',
          academicYear: mapAcademicYearNumberToOption(p.academicYear),
          availabilityStatus: p.availabilityStatus || 'AVAILABLE',
          isPublic: p.isPublic ?? true
        });
      }
    } catch (e) {
      console.error('Profile loading error:', e);
      setProfileError(e.response?.data?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Ensure we have user ID from token if not in user object
    if (!user?.id && user?.email) {
      const userId = apiUtils.getUserIdFromToken();
      if (userId) {
        // Update user object with ID
        dispatch(updateUser({ id: userId }));
      }
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email]);

  const handleDeleteAccount = async () => {
    if (confirmEmail !== user?.email) {
      setDeleteError('Email does not match your account email');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      const response = await apiService.auth.deleteAccount(user.email);
      
      if (response.data.success) {
        // Logout user after successful deletion
        dispatch(logoutUser());
        navigate(ROUTES.LOGIN);
      } else {
        setDeleteError(response.data.message || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to delete account. Please try again.';
      setDeleteError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  // Password validation functions
  const validateNewPassword = (password) => {
    if (!password) {
      return 'New password is required';
    }
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    
    return '';
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      return 'Please confirm your new password';
    }
    
    if (changePasswordData.newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return '';
  };

  const handleChangePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setChangePasswordData({
      ...changePasswordData,
      [name]: value
    });
    
    // Clear field-specific errors
    if (changePasswordErrors[name]) {
      setChangePasswordErrors({
        ...changePasswordErrors,
        [name]: ''
      });
    }
  };

  const handleChangePasswordBlur = (e) => {
    const { name } = e.target;
    setChangePasswordTouched({
      ...changePasswordTouched,
      [name]: true
    });
  };

  const validateChangePasswordForm = () => {
    const errors = {};
    
    if (!changePasswordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    errors.newPassword = validateNewPassword(changePasswordData.newPassword);
    errors.confirmPassword = validateConfirmPassword(changePasswordData.confirmPassword);
    
    setChangePasswordErrors(errors);
    return Object.keys(errors).filter(key => errors[key]).length === 0;
  };

  const handleChangePasswordSubmit = async () => {
    // Mark all fields as touched to show validation errors
    setChangePasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });
    
    if (!validateChangePasswordForm()) {
      return;
    }
    
    setChangePasswordLoading(true);
    setChangePasswordError('');
    setChangePasswordSuccess('');

    try {
      const response = await apiService.auth.changePassword({
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword
      });
      
      if (response.data.success) {
        setChangePasswordSuccess('Password changed successfully!');
        // Clear form
        setChangePasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Close dialog after 2 seconds
        setTimeout(() => {
          setChangePasswordOpen(false);
          setChangePasswordSuccess('');
        }, 2000);
      } else {
        setChangePasswordError(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to change password. Please try again.';
      setChangePasswordError(errorMessage);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleCloseChangePassword = () => {
    setChangePasswordOpen(false);
    setChangePasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setChangePasswordErrors({});
    setChangePasswordTouched({});
    setChangePasswordError('');
    setChangePasswordSuccess('');
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };


  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setProfileError('');
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveProfile = async () => {
    try {
      setSaveLoading(true);
      setProfileError('');
      
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        major: form.major,
        academicYear: form.academicYear,
        availabilityStatus: form.availabilityStatus,
        isPublic: form.isPublic
      };
      
      if (profileId) {
        // Update existing profile
        const res = await apiService.profiles.update(profileId, payload);
        if (res.status === 200) {
          // Reload profile to get updated data
          await loadProfile();
          setEditOpen(false);
        }
      } else {
        // Create new profile
        const res = await apiService.profiles.create(payload);
        if (res.status === 201) {
          // Reload profile to get the created profile data
          await loadProfile();
          setEditOpen(false);
        }
      }
    } catch (e) {
      console.error('Profile save error:', e);
      const errorMessage = e.response?.data?.message || 'Failed to save profile';
      setProfileError(errorMessage);
      
      // If it's an authorization error, try to reload the profile
      if (errorMessage.includes('not authorized')) {
        console.log('Authorization error detected, reloading profile...');
        await loadProfile();
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
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
              Profile & Settings
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Single Merged Profile Card */}
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Account Information Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Account Information</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {user?.email || 'Not available'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Account Role
                </Typography>
                <Chip 
                  label={user?.role || 'STUDENT'} 
                  sx={{ 
                    mb: 2,
                    backgroundColor: '#E3F2FD',
                    color: '#1976D2',
                    border: '2px solid #1976D2',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#BBDEFB',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                />
              </Box>
              
              <Button 
                variant="contained" 
                startIcon={<Edit />} 
                onClick={handleEditOpen}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: '2px solid #4CAF50',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#45A049',
                    border: '2px solid #45A049',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                Edit Profile
              </Button>
            </Grid>

            {/* Security Settings Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Security Settings</Typography>
              </Box>
              
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setChangePasswordOpen(true)}
                fullWidth
                sx={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: '2px solid #FF9800',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#F57C00',
                    border: '2px solid #F57C00',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                Change Password
              </Button>
            </Grid>

            {/* Account Actions Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Account Actions
              </Typography>
              
              <Button
                variant="outlined"
                color="info"
                fullWidth
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ mb: 2 }}
              >
                Sign Out
              </Button>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Danger Zone
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This action cannot be undone. All your data will be permanently deleted.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Delete Account Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1, color: 'error.main' }} />
              Delete Account
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                This action is irreversible!
              </Typography>
              <Typography variant="body2">
                Deleting your account will permanently remove all your data including:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <Typography component="li" variant="body2">
                  All created tasks and bids
                </Typography>
                <Typography component="li" variant="body2">
                  Account balance and transaction history
                </Typography>
                <Typography component="li" variant="body2">
                  Profile information and ratings
                </Typography>
                <Typography component="li" variant="body2">
                  All associated data and files
                </Typography>
              </Box>
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              To confirm deletion, please enter your email address:
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>{user?.email}</strong>
            </Typography>
            
            <TextField
              fullWidth
              label="Confirm Email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              error={!!deleteError}
              helperText={deleteError}
              placeholder="Enter your email to confirm"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || confirmEmail !== user?.email}
              startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog 
          open={changePasswordOpen} 
          onClose={handleCloseChangePassword}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Change Password
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your current password and choose a new password.
            </Typography>
            
            {changePasswordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {changePasswordError}
              </Alert>
            )}
            
            {changePasswordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {changePasswordSuccess}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              name="currentPassword"
              value={changePasswordData.currentPassword}
              onChange={handleChangePasswordChange}
              onBlur={handleChangePasswordBlur}
              error={changePasswordTouched.currentPassword && !!changePasswordErrors.currentPassword}
              helperText={changePasswordTouched.currentPassword && changePasswordErrors.currentPassword}
              disabled={changePasswordLoading}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              name="newPassword"
              value={changePasswordData.newPassword}
              onChange={handleChangePasswordChange}
              onBlur={handleChangePasswordBlur}
              error={changePasswordTouched.newPassword && !!changePasswordErrors.newPassword}
              helperText={changePasswordTouched.newPassword && changePasswordErrors.newPassword ? changePasswordErrors.newPassword : "Must be at least 8 characters with uppercase, lowercase, number, and special character"}
              disabled={changePasswordLoading}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={changePasswordData.confirmPassword}
              onChange={handleChangePasswordChange}
              onBlur={handleChangePasswordBlur}
              error={changePasswordTouched.confirmPassword && !!changePasswordErrors.confirmPassword}
              helperText={changePasswordTouched.confirmPassword && changePasswordErrors.confirmPassword ? changePasswordErrors.confirmPassword : "Re-enter your new password"}
              disabled={changePasswordLoading}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleCloseChangePassword}
              disabled={changePasswordLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePasswordSubmit}
              disabled={changePasswordLoading}
              startIcon={changePasswordLoading ? <CircularProgress size={20} /> : null}
            >
              {changePasswordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogActions>
        </Dialog>

          {/* Edit Profile Dialog */}
          <Dialog 
            open={editOpen} 
            onClose={handleEditClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>
              )}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" name="firstName" value={form.firstName} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="College" value="RGUKT NUZVID" disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Major" name="major" value={form.major} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Academic Year"
                    name="academicYear"
                    value={form.academicYear}
                    onChange={onChange}
                    SelectProps={{ native: true }}
                  >
                    {ACADEMIC_YEAR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Availability"
                    name="availabilityStatus"
                    value={form.availabilityStatus}
                    onChange={onChange}
                    SelectProps={{ native: true }}
                  >
                    {Object.keys(AVAILABILITY_STATUS).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">Public Profile</Typography>
                    <input type="checkbox" name="isPublic" checked={!!form.isPublic} onChange={onChange} />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleEditClose} disabled={saveLoading}>Cancel</Button>
              <Button variant="contained" onClick={saveProfile} disabled={saveLoading} startIcon={saveLoading ? <CircularProgress size={20} /> : <Save />}>
                {saveLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
      </Container>
      </Box>
    </Layout>
  );
};

export default ProfilePage;
