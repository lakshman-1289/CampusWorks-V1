import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { 
  calculateTimeRemaining, 
  formatCountdown, 
  getCountdownColor, 
  getCountdownUrgency,
  shouldCountdownBlink,
  getCountdownStatus
} from '@utils/countdownUtils';

const CountdownTimer = ({ 
  deadline, 
  variant = 'default', // 'default', 'compact', 'minimal'
  showStatus = true,
  showTooltip = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  // Debug logging
  console.log('CountdownTimer rendered with deadline:', deadline);
  console.log('Deadline type:', typeof deadline);
  console.log('Deadline value:', deadline);
  
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (!deadline) {
      console.warn('CountdownTimer: No deadline provided');
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true
      };
    }
    
    const calculated = calculateTimeRemaining(deadline);
    console.log('Initial time remaining:', calculated);
    return calculated;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  const color = getCountdownColor(timeRemaining);
  const urgency = getCountdownUrgency(timeRemaining);
  const shouldBlink = shouldCountdownBlink(timeRemaining);
  const status = getCountdownStatus(timeRemaining);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: '0.75rem',
          padding: '2px 6px',
          minHeight: '20px'
        };
      case 'large':
        return {
          fontSize: '1.1rem',
          padding: '8px 12px',
          minHeight: '32px'
        };
      default: // medium
        return {
          fontSize: '0.875rem',
          padding: '4px 8px',
          minHeight: '24px'
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5
        };
      case 'minimal':
        return {
          display: 'inline',
          fontSize: '0.75rem',
          color: color
        };
      default: // default
        return {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5
        };
    }
  };

  const renderCountdown = () => {
    try {
      if (variant === 'minimal') {
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              color: color,
              fontWeight: 'bold',
              ...(shouldBlink && {
                animation: 'blink 1s infinite'
              })
            }}
          >
            {formatCountdown(timeRemaining)}
          </Typography>
        );
      }

      if (variant === 'compact') {
        return (
          <Chip
            label={formatCountdown(timeRemaining)}
            size="small"
            sx={{
              backgroundColor: urgency === 'expired' ? '#f44336' : 
                             urgency === 'critical' ? '#f44336' :
                             urgency === 'warning' ? '#ff9800' :
                             urgency === 'caution' ? '#ffc107' : '#4caf50',
              color: 'white',
              fontWeight: 'bold',
              ...getSizeStyles(),
              ...(shouldBlink && {
                animation: 'blink 1s infinite'
              })
            }}
          />
        );
      }

      // Default variant
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: color,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              ...getSizeStyles(),
              ...(shouldBlink && {
                animation: 'blink 1s infinite'
              })
            }}
          >
            {formatCountdown(timeRemaining)}
          </Typography>
          {showStatus && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: color,
                fontSize: '0.7rem',
                display: 'block',
                mt: 0.5
              }}
            >
              {status}
            </Typography>
          )}
        </Box>
      );
    } catch (error) {
      console.error('Error rendering countdown timer:', error);
      return (
        <Typography variant="body2" color="error">
          Timer Error: {deadline}
        </Typography>
      );
    }
  };

  // Safety check
  if (!deadline) {
    return (
      <Typography variant="body2" color="text.secondary">
        No deadline set
      </Typography>
    );
  }

  return (
    <Box sx={getVariantStyles()}>
      {renderCountdown()}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
        `}
      </style>
    </Box>
  );
};

export default CountdownTimer;
