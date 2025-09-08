import React from 'react';
import { Box } from '@mui/material';
import Navigation from '@components/organisms/Navigation';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          py: 3
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
