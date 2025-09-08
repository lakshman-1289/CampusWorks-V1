import { createTheme } from '@mui/material/styles';

// Custom color palette based on #C6D0DF
const palette = {
  primary: {
    main: '#C6D0DF',
    light: '#D8E2ED',
    dark: '#A8B8C8',
    contrastText: '#2C3E50'
  },
  secondary: {
    main: '#A8B8C8',
    light: '#BCC8D4',
    dark: '#8FA3B3',
    contrastText: '#FFFFFF'
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C'
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00'
  },
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F'
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2'
  },
  background: {
    default: '#FAFBFC',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#2C3E50',
    secondary: '#546E7A'
  }
};

// Typography configuration with Outfit font
const typography = {
  fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2
  },
  h2: {
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: 1.3
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.3
  },
  h4: {
    fontWeight: 500,
    fontSize: '1.5rem',
    lineHeight: 1.4
  },
  h5: {
    fontWeight: 500,
    fontSize: '1.25rem',
    lineHeight: 1.4
  },
  h6: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5
  },
  body1: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.5
  },
  body2: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.5
  },
  button: {
    fontWeight: 500,
    fontSize: '0.875rem',
    textTransform: 'none',
    letterSpacing: '0.02em'
  },
  caption: {
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.4
  },
  overline: {
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  }
};

// Component overrides
const components = {
  // Button overrides
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        padding: '10px 24px',
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(198, 208, 223, 0.3)'
        }
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #C6D0DF 0%, #A8B8C8 100%)',
        color: '#2C3E50',
        '&:hover': {
          background: 'linear-gradient(135deg, #A8B8C8 0%, #8FA3B3 100%)'
        }
      }
    }
  },
  
  // Card overrides
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(44, 62, 80, 0.12)'
        }
      }
    }
  },
  
  // Paper overrides
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '8px'
      }
    }
  },
  
  // TextField overrides
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          '& fieldset': {
            borderColor: '#E0E0E0'
          },
          '&:hover fieldset': {
            borderColor: '#C6D0DF'
          },
          '&.Mui-focused fieldset': {
            borderColor: '#A8B8C8'
          }
        }
      }
    }
  },
  
  // Chip overrides
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
        fontWeight: 500
      }
    }
  },
  
  // AppBar overrides
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: '#FFFFFF',
        color: '#2C3E50',
        boxShadow: '0 1px 4px rgba(44, 62, 80, 0.08)'
      }
    }
  },
  
  // Drawer overrides
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: '1px solid #E0E0E0'
      }
    }
  }
};

// Breakpoints
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  }
};

// Spacing
const spacing = 8;

// Shape
const shape = {
  borderRadius: 8
};

// Create theme
const theme = createTheme({
  palette,
  typography,
  components,
  breakpoints,
  spacing,
  shape,
  
  // Custom theme extensions
  custom: {
    gradients: {
      primary: 'linear-gradient(135deg, #C6D0DF 0%, #A8B8C8 100%)',
      secondary: 'linear-gradient(135deg, #A8B8C8 0%, #8FA3B3 100%)',
      success: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      error: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'
    },
    shadows: {
      card: '0 2px 12px rgba(44, 62, 80, 0.08)',
      cardHover: '0 4px 20px rgba(44, 62, 80, 0.12)',
      button: '0 2px 8px rgba(198, 208, 223, 0.3)'
    },
    transitions: {
      default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      slow: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
});

export default theme;
