import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Store and theme
import { store } from '@store';
import theme from '@theme';

// Components
import ProtectedRoute from '@components/organisms/ProtectedRoute';
import ToastContainer from '@components/atoms/ToastContainer';

// Pages
import LandingPage from '@pages/LandingPage';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import EmailVerificationPage from '@pages/auth/EmailVerificationPage';
import ResetPasswordPage from '@pages/auth/ResetPasswordPage';
import DashboardPage from '@pages/dashboard/DashboardPage';
import TasksPage from '@pages/tasks/TasksPage';
import TaskDetailPage from '@pages/tasks/TaskDetailPage';
import CreateTaskPage from '@pages/tasks/CreateTaskPage';
import EditTaskPage from '@pages/tasks/EditTaskPage';
import MyTasksPage from '@pages/tasks/MyTasksPage';
import BidsPage from '@pages/bids/BidsPage';
import MyBidsPage from '@pages/bids/MyBidsPage';
import ProfilePage from '@pages/profile/ProfilePage';


// Test Components
import CountdownTest from '@components/test/CountdownTest';

// Constants
import { ROUTES } from '@constants';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Landing Page */}
            <Route 
              path={ROUTES.HOME} 
              element={<LandingPage />} 
            />
            
            {/* Public Routes */}
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.REGISTER} 
              element={
                <ProtectedRoute requireAuth={false}>
                  <RegisterPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.VERIFY_EMAIL} 
              element={
                <ProtectedRoute requireAuth={false}>
                  <EmailVerificationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.RESET_PASSWORD} 
              element={
                <ProtectedRoute requireAuth={false}>
                  <ResetPasswordPage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path={ROUTES.DASHBOARD} 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.TASKS} 
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.TASK_DETAIL} 
              element={
                <ProtectedRoute>
                  <TaskDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.CREATE_TASK} 
              element={
                <ProtectedRoute>
                  <CreateTaskPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.EDIT_TASK} 
              element={
                <ProtectedRoute>
                  <EditTaskPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.MY_TASKS} 
              element={
                <ProtectedRoute>
                  <MyTasksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.BIDS} 
              element={
                <ProtectedRoute>
                  <BidsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.MY_BIDS} 
              element={
                <ProtectedRoute>
                  <MyBidsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.PROFILE} 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Test Route */}
            <Route 
              path="/test-countdown" 
              element={
                <ProtectedRoute>
                  <CountdownTest />
                </ProtectedRoute>
              } 
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Router>
        <ToastContainer />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
