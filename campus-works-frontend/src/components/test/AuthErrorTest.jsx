import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Stack,
  Divider,
  TextField
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthError, selectAuthLoading } from '@store/slices/authSlice';
import apiService from '@services/api';

const AuthErrorTest = () => {
  const dispatch = useDispatch();
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);
  
  const [testEmail, setTestEmail] = useState('n210419@rguktn.ac.in');
  const [testPassword, setTestPassword] = useState('TestPassword123!');
  const [testResults, setTestResults] = useState([]);

  const runErrorTests = async () => {
    const tests = [
      {
        name: 'Invalid Email Format',
        email: 'invalid-email',
        password: 'TestPassword123!',
        expectedError: 'Please enter a valid RGUKT Nuzvidu email'
      },
      {
        name: 'Non-RGUKT Email',
        email: 'test@gmail.com',
        password: 'TestPassword123!',
        expectedError: 'Please enter a valid RGUKT Nuzvidu email'
      },
      {
        name: 'Empty Email',
        email: '',
        password: 'TestPassword123!',
        expectedError: 'Email is required'
      },
      {
        name: 'Empty Password',
        email: 'n210419@rguktn.ac.in',
        password: '',
        expectedError: 'Password is required'
      },
      {
        name: 'Short Password',
        email: 'n210419@rguktn.ac.in',
        password: '123',
        expectedError: 'Password must be at least 8 characters long'
      },
      {
        name: 'Non-existent User',
        email: 'n999999@rguktn.ac.in',
        password: 'TestPassword123!',
        expectedError: 'No account found with this email address'
      },
      {
        name: 'Wrong Password',
        email: 'n210419@rguktn.ac.in',
        password: 'WrongPassword123!',
        expectedError: 'Invalid email or password'
      }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        setTestEmail(test.email);
        setTestPassword(test.password);
        
        const result = await dispatch(loginUser({
          email: test.email,
          password: test.password
        }));
        
        if (loginUser.rejected.match(result)) {
          const actualError = result.payload.message;
          const isExpected = actualError.includes(test.expectedError) || 
                           actualError === test.expectedError;
          
          results.push({
            ...test,
            actualError,
            passed: isExpected,
            status: isExpected ? 'PASS' : 'FAIL'
          });
        } else {
          results.push({
            ...test,
            actualError: 'Login succeeded unexpectedly',
            passed: false,
            status: 'FAIL'
          });
        }
      } catch (err) {
        results.push({
          ...test,
          actualError: err.message,
          passed: false,
          status: 'ERROR'
        });
      }
    }
    
    setTestResults(results);
  };

  const testEmailVerification = async () => {
    try {
      // Test with invalid token
      const response = await apiService.auth.verifyEmail('invalid-token');
      console.log('Verification response:', response);
    } catch (error) {
      console.log('Verification error:', error);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" gutterBottom>
            Authentication Error Handling Test
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This component tests the improved error handling for authentication.
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Test Login Error Messages
              </Typography>
              <Button
                variant="contained"
                onClick={runErrorTests}
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                Run Error Tests
              </Button>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Current Error: {error}
                </Alert>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Test Email Verification
              </Typography>
              <Button
                variant="outlined"
                onClick={testEmailVerification}
                sx={{ mb: 2 }}
              >
                Test Email Verification Error
              </Button>
            </Box>

            <Divider />

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
                        {result.name} - {result.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Expected:</strong> {result.expectedError}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Actual:</strong> {result.actualError}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="h6" gutterBottom>
                Manual Test Form
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Test Email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="n210419@rguktn.ac.in"
                  fullWidth
                />
                <TextField
                  label="Test Password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={() => dispatch(loginUser({ email: testEmail, password: testPassword }))}
                  disabled={isLoading}
                >
                  Test Login
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthErrorTest;
