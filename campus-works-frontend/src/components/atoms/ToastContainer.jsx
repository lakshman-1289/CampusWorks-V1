import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { removeNotification, selectNotifications } from '@services/toastService';

const ToastContainer = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  const handleClose = (notificationId) => {
    dispatch(removeNotification(notificationId));
  };

  const handleAutoClose = (notification) => {
    if (notification.duration > 0) {
      setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);
    }
  };

  useEffect(() => {
    // Auto-close notifications
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        handleAutoClose(notification);
      }
    });
  }, [notifications]);

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration || 4000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }} // Add margin to avoid header overlap
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.severity || 'info'}
            variant="filled"
            sx={{ 
              width: '100%',
              minWidth: '300px',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            {notification.title && (
              <AlertTitle sx={{ fontWeight: 'bold' }}>
                {notification.title}
              </AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastContainer;
