import React, { useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography, Button } from '@mui/material';
import ApplierDashboard from './ApplierDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import CompanyDashboard from './CompanyDashboard'; // You'll need to create this
import { AccountCircle, Business, Work } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading, userType, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Show loading spinner while authentication status is being determined
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render the appropriate dashboard based on user type
  const renderDashboard = () => {
    switch (userType) {
      case 'applier':
        return <ApplierDashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'company':
        return <CompanyDashboard />;
      default:
        return (
          <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Unknown User Type
            </Typography>
            <Typography variant="body1" paragraph>
              There was an error determining your user type. Please log out and try again.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button variant="contained" color="primary" onClick={logout}>
                Log Out
              </Button>
            </Box>
          </Container>
        );
    }
  };

  // Render the dashboard header with information about current user role
  const renderUserTypeIndicator = () => {
    let icon;
    let label;

    switch (userType) {
      case 'applier':
        icon = <AccountCircle color="primary" />;
        label = "Job Seeker Dashboard";
        break;
      case 'recruiter':
        icon = <Work color="primary" />;
        label = "Recruiter Dashboard";
        break;
      case 'company':
        icon = <Business color="primary" />;
        label = "Company Dashboard";
        break;
      default:
        icon = null;
        label = "Dashboard";
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          py: 1,
          px: 2,
          mb: 3,
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        {icon}
        <Typography variant="subtitle1">{label}</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderDashboard()}
    </Box>
  );
};

export default Dashboard;