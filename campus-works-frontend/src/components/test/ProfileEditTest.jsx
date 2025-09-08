import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, updateUser } from '@store/slices/authSlice';
import apiService, { apiUtils } from '@services/api';

const ProfileEditTest = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  
  const [testResults, setTestResults] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
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
      setLoading(true);
      setError('');
      
      const userId = user?.id || apiUtils.getUserIdFromToken();
      let res = null;
      
      if (userId) {
        res = await apiService.profiles.getByUser(userId);
      } else if (user?.email) {
        res = await apiService.profiles.getByUserEmail(user.email);
      }

      if (res && res.status === 200 && res.data) {
        const p = res.data;
        setProfileData(p);
        setFormData({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          major: p.major || '',
          academicYear: mapAcademicYearNumberToOption(p.academicYear),
          availabilityStatus: p.availabilityStatus || 'AVAILABLE',
          isPublic: p.isPublic ?? true
        });
        
        setTestResults(prev => [...prev, {
          test: 'Profile Load',
          status: 'PASS',
          message: 'Profile loaded successfully',
          data: p
        }]);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load profile');
      setTestResults(prev => [...prev, {
        test: 'Profile Load',
        status: 'FAIL',
        message: e.response?.data?.message || 'Failed to load profile',
        error: e
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testProfileUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = user?.id || apiUtils.getUserIdFromToken();
      
      if (!profileData?.id) {
        setTestResults(prev => [...prev, {
          test: 'Profile Update',
          status: 'FAIL',
          message: 'No profile ID available for update'
        }]);
        return;
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        major: formData.major,
        academicYear: formData.academicYear,
        availabilityStatus: formData.availabilityStatus,
        isPublic: formData.isPublic
      };

      const res = await apiService.profiles.update(profileData.id, payload);
      
      if (res.status === 200) {
        setTestResults(prev => [...prev, {
          test: 'Profile Update',
          status: 'PASS',
          message: 'Profile updated successfully',
          data: res.data
        }]);
        
        // Reload profile to verify changes
        await loadProfile();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update profile');
      setTestResults(prev => [...prev, {
        test: 'Profile Update',
        status: 'FAIL',
        message: e.response?.data?.message || 'Failed to update profile',
        error: e
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testProfileCreate = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        major: formData.major,
        academicYear: formData.academicYear,
        availabilityStatus: formData.availabilityStatus,
        isPublic: formData.isPublic
      };

      const res = await apiService.profiles.create(payload);
      
      if (res.status === 201) {
        setTestResults(prev => [...prev, {
          test: 'Profile Create',
          status: 'PASS',
          message: 'Profile created successfully',
          data: res.data
        }]);
        
        // Reload profile to verify creation
        await loadProfile();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create profile');
      setTestResults(prev => [...prev, {
        test: 'Profile Create',
        status: 'FAIL',
        message: e.response?.data?.message || 'Failed to create profile',
        error: e
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testUserData = () => {
    const userId = apiUtils.getUserIdFromToken();
    const email = apiUtils.getEmailFromToken();
    
    setTestResults(prev => [...prev, {
      test: 'User Data Extraction',
      status: userId ? 'PASS' : 'FAIL',
      message: `User ID: ${userId}, Email: ${email}`,
      data: { userId, email, userObject: user }
    }]);
  };

  useEffect(() => {
    if (user?.email) {
      loadProfile();
      testUserData();
    }
  }, [user?.email]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" gutterBottom>
            Profile Edit Test
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This component tests the profile editing functionality and authorization.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Typography variant="body2">
                <strong>User ID from Token:</strong> {apiUtils.getUserIdFromToken() || 'Not available'}
              </Typography>
              <Typography variant="body2">
                <strong>Email from Token:</strong> {apiUtils.getEmailFromToken() || 'Not available'}
              </Typography>
              <Typography variant="body2">
                <strong>User Object:</strong> {JSON.stringify(user, null, 2)}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Data
              </Typography>
              {profileData ? (
                <Typography variant="body2">
                  <strong>Profile ID:</strong> {profileData.id}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No profile data loaded
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Form
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    label="Academic Year"
                  >
                    {ACADEMIC_YEAR_OPTIONS.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    name="availabilityStatus"
                    value={formData.availabilityStatus}
                    onChange={handleChange}
                    label="Availability"
                  >
                    <MenuItem value="AVAILABLE">Available</MenuItem>
                    <MenuItem value="BUSY">Busy</MenuItem>
                    <MenuItem value="UNAVAILABLE">Unavailable</MenuItem>
                    <MenuItem value="ON_BREAK">On Break</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                    />
                  }
                  label="Public Profile"
                />
              </Stack>
            </Box>

            <Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={loadProfile}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Load Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={testProfileUpdate}
                  disabled={loading || !profileData?.id}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Test Update
                </Button>
                <Button
                  variant="outlined"
                  onClick={testProfileCreate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Test Create
                </Button>
              </Stack>
            </Box>

            {testResults.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Test Results
                </Typography>
                <Stack spacing={2}>
                  {testResults.map((result, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        borderLeft: 4,
                        borderLeftColor: result.status === 'PASS' ? 'success.main' : 'error.main'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {result.test} - {result.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.message}
                      </Typography>
                      {result.data && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>Data:</strong> {JSON.stringify(result.data, null, 2)}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfileEditTest;
