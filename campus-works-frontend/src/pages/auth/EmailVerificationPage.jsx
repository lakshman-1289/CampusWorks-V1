import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Email,
  Refresh,
  Login
} from '@mui/icons-material';
import { ROUTES } from '@constants';
import apiService from '@services/api';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [verificationState, setVerificationState] = useState({
    loading: true,
    success: false,
    error: null,
    message: ''
  });
  
  const [resendState, setResendState] = useState({
    loading: false,
    success: false,
    error: null
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationState({
        loading: false,
        success: false,
        error: 'No verification token provided',
        message: 'Invalid verification link'
      });
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      setVerificationState(prev => ({ ...prev, loading: true }));
      
      const response = await apiService.auth.verifyEmail(verificationToken);
      
      // The response data is in response.data, not response directly
      const responseData = response.data;
      
      if (responseData.success) {
        setVerificationState({
          loading: false,
          success: true,
          error: null,
          message: responseData.message || 'Email verified successfully!'
        });
      } else {
        // Check if user is already verified
        if (responseData.message && (responseData.message.includes('already verified') || responseData.message.includes('already active'))) {
          setVerificationState({
            loading: false,
            success: true,
            error: null,
            message: 'Your email is already verified! You can now sign in to your account.'
          });
        } else {
          setVerificationState({
            loading: false,
            success: false,
            error: responseData.message || 'Verification failed',
            message: responseData.message || 'Email verification failed'
          });
        }
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      // Check if the error indicates user is already verified
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during verification';
      
      if (errorMessage.includes('already verified') || errorMessage.includes('already active')) {
        setVerificationState({
          loading: false,
          success: true,
          error: null,
          message: 'Your email is already verified! You can now sign in to your account.'
        });
      } else if (error.response?.status === 400 && (errorMessage.includes('invalid') || errorMessage.includes('expired'))) {
        setVerificationState({
          loading: false,
          success: false,
          error: 'Invalid or expired verification link',
          message: 'The verification link is invalid or has expired. Please request a new one.'
        });
      } else if (error.response?.status === 400 && errorMessage.includes('already used')) {
        setVerificationState({
          loading: false,
          success: true,
          error: null,
          message: 'This verification link has already been used. Your email is already verified!'
        });
      } else {
        setVerificationState({
          loading: false,
          success: false,
          error: errorMessage,
          message: errorMessage
        });
      }
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address to resend verification:');
    
    if (!email) return;
    
    // Validate email format
    const emailRegex = /^n\d{6}@rguktn\.ac\.in$/;
    if (!emailRegex.test(email)) {
      setResendState({
        loading: false,
        success: false,
        error: 'Please enter a valid RGUKT Nuzvidu email (n######@rguktn.ac.in)'
      });
      return;
    }

    try {
      setResendState({ loading: true, success: false, error: null });
      
      const response = await apiService.auth.resendVerification(email);
      
      // The response data is in response.data, not response directly
      const responseData = response.data;
      
      if (responseData.success) {
        setResendState({
          loading: false,
          success: true,
          error: null
        });
      } else {
        setResendState({
          loading: false,
          success: false,
          error: responseData.message || 'Failed to resend verification email'
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to resend verification email';
      
      setResendState({
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  const handleGoToLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleGoToRegister = () => {
    navigate(ROUTES.REGISTER);
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
        <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
          {/* Loading State */}
          {verificationState.loading && (
            <Box>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verifying Your Email...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we verify your email address.
              </Typography>
            </Box>
          )}

          {/* Success State */}
          {!verificationState.loading && verificationState.success && (
            <Box>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom color="success.main">
                Email Verified Successfully! 🎉
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
                {verificationState.message}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Your CampusWorks account is now active. You can start using all features of the platform.
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Login />}
                  onClick={handleGoToLogin}
                  sx={{ py: 1.5 }}
                >
                  Sign In to Your Account
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                  Welcome to the CampusWorks community! 🎓
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Error State */}
          {!verificationState.loading && !verificationState.success && (
            <Box>
              <Error sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom color="error.main">
                Email Verification Failed
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
                {verificationState.message}
              </Typography>

              {/* Resend Section */}
              <Box sx={{ mb: 4 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Need a new verification link?
                </Typography>
                
                {resendState.success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Verification email sent successfully! Please check your inbox.
                  </Alert>
                )}
                
                {resendState.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {resendState.error}
                  </Alert>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={resendState.loading ? <CircularProgress size={20} /> : <Refresh />}
                  onClick={handleResendVerification}
                  disabled={resendState.loading}
                  sx={{ mb: 2 }}
                >
                  {resendState.loading ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={handleGoToRegister}
                >
                  Register Again
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Login />}
                  onClick={handleGoToLogin}
                >
                  Try Signing In
                </Button>
              </Stack>

              {/* Help Text */}
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Common Issues:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" component="ul" sx={{ textAlign: 'left', mt: 1 }}>
                  <li>Verification link may have expired (valid for 24 hours)</li>
                  <li>Link may have already been used</li>
                  <li>Check your spam/junk folder for the email</li>
                  <li>Make sure you're using your RGUKT Nuzvidu email</li>
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationPage;
