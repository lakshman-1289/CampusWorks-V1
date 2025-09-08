import React from 'react';
import { Box, Typography, Paper, Grid, Alert } from '@mui/material';
import Layout from '@components/templates/Layout';
import CountdownTimer from '@components/common/CountdownTimer';

const CountdownTest = () => {
  // Test with different deadlines
  const testDeadlines = {
    future2h: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    future30min: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    future5min: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
    past: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    september2025: "2025-09-04T16:35:00.000Z" // September 4, 2025 at 04:35 PM
  };
  
  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Countdown Timer Test Page
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This page tests all countdown timer variants. Check browser console for debug logs.
        </Alert>
        
        <Grid container spacing={3}>
          {/* Test 1: Default Variant */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Default Variant (2 hours from now)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Deadline: {testDeadlines.future2h}
              </Typography>
              <CountdownTimer 
                deadline={testDeadlines.future2h}
                variant="default"
                size="medium"
              />
            </Paper>
          </Grid>
          
          {/* Test 2: Compact Variant */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Compact Variant (30 minutes from now)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Deadline: {testDeadlines.future30min}
              </Typography>
              <CountdownTimer 
                deadline={testDeadlines.future30min}
                variant="compact"
                size="small"
              />
            </Paper>
          </Grid>
          
          {/* Test 3: Minimal Variant */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Minimal Variant (5 minutes from now)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Deadline: {testDeadlines.future5min}
              </Typography>
              <CountdownTimer 
                deadline={testDeadlines.future5min}
                variant="minimal"
                size="small"
              />
            </Paper>
          </Grid>
          
          {/* Test 4: Expired Deadline */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Expired Deadline (1 hour ago)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Deadline: {testDeadlines.past}
              </Typography>
              <CountdownTimer 
                deadline={testDeadlines.past}
                variant="default"
                size="medium"
              />
            </Paper>
          </Grid>
          
          {/* Test 5: September 2025 Deadline */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                September 2025 Deadline (Like in your screenshot)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Deadline: {testDeadlines.september2025}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Default:</Typography>
                  <CountdownTimer 
                    deadline={testDeadlines.september2025}
                    variant="default"
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Compact:</Typography>
                  <CountdownTimer 
                    deadline={testDeadlines.september2025}
                    variant="compact"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Minimal:</Typography>
                  <CountdownTimer 
                    deadline={testDeadlines.september2025}
                    variant="minimal"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Current Time: {new Date().toISOString()}
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
};

export default CountdownTest;
