import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { registerUser, selectAuthLoading, selectAuthError, selectAuthMessage } from '@store/slices/authSlice';
import { ROUTES } from '@constants';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // College email validation regex
  const COLLEGE_EMAIL_REGEX = /^n\d{6}@rguktn\.ac\.in$/;
  
  const validateCollegeEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    
    if (!COLLEGE_EMAIL_REGEX.test(email)) {
      return 'Only RGUKT Nuzvidu college emails are allowed. Format: n######@rguktn.ac.in';
    }
    
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
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
      return 'Please confirm your password';
    }
    
    if (formData.password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return '';
  };

  // Real-time validation on field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate field in real-time if it has been touched
    if (touched[name]) {
      let fieldError = '';
      
      switch (name) {
        case 'email':
          fieldError = validateCollegeEmail(value);
          break;
        case 'password':
          fieldError = validatePassword(value);
          break;
        case 'confirmPassword':
          fieldError = validateConfirmPassword(value);
          break;
        default:
          break;
      }
      
      setFormErrors({
        ...formErrors,
        [name]: fieldError
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    errors.email = validateCollegeEmail(formData.email);
    errors.password = validatePassword(formData.password);
    errors.confirmPassword = validateConfirmPassword(formData.confirmPassword);
    
    setFormErrors(errors);
    return Object.keys(errors).filter(key => errors[key]).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    setTouched({
      email: true,
      password: true,
      confirmPassword: true
    });
    
    if (!validateForm()) {
      return;
    }
    
    const result = await dispatch(registerUser({
      email: formData.email,
      password: formData.password
    }));
    
    if (registerUser.fulfilled.match(result)) {
      // Registration successful - user needs to verify email
      // Don't automatically redirect, let them read the message
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Join CampusWorks
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Create your account to get started
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="College Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              placeholder="n210419@rguktn.ac.in"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && !!formErrors.email}
              helperText={touched.email && formErrors.email ? formErrors.email : "Enter your RGUKT Nuzvidu email"}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && !!formErrors.password}
              helperText={touched.password && formErrors.password ? formErrors.password : "Must be at least 8 characters with uppercase, lowercase, number, and special character"}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && !!formErrors.confirmPassword}
              helperText={touched.confirmPassword && formErrors.confirmPassword ? formErrors.confirmPassword : "Re-enter your password"}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            
            <Box textAlign="center">
              <Link to={ROUTES.LOGIN}>
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
