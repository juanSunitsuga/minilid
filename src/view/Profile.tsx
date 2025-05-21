import React from 'react';
import { useAuth } from './Context/AuthContext';
import {
  Container, 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  IconButton, 
  Button,
  Divider,
  Chip,
  Grid,
  Skeleton
} from '@mui/material';
import { 
  CameraAlt as CameraIcon, 
  Edit as EditIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const Profile: React.FC = () => {
  const { userData, companyData, userType, isLoading } = useAuth();
  
  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ position: 'relative', mb: 10 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px 16px 0 0' }} />
          <Skeleton 
            variant="circular"
            width={150}
            height={150}
            sx={{
              position: 'absolute',
              left: 24,
              bottom: -75,
            }}
          />
        </Box>
        <Box sx={{ mt: 10, ml: { xs: 0, sm: 20 } }}>
          <Skeleton variant="text" height={60} width="60%" />
          <Skeleton variant="text" height={30} width="40%" />
          <Skeleton variant="text" height={30} width="30%" />
        </Box>
      </Container>
    );
  }
  
  // Render different profile based on user type
  const renderProfileContent = () => {
    if (userType === 'applier' || userType === 'recruiter') {
      // Individual user profile
      return renderIndividualProfile();
    } else if (userType === 'company') {
      // Company profile
      return renderCompanyProfile();
    } else {
      // Not logged in
      return (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h5">Please log in to view your profile</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => {
              // You can implement login modal opening here
            }}
          >
            Login
          </Button>
        </Paper>
      );
    }
  };
  
  // Individual user (applier or recruiter) profile
  const renderIndividualProfile = () => {
    if (!userData) return null;
    
    return (
      <>
        {/* Cover image */}
        <Box 
          sx={{ 
            height: 200, 
            borderRadius: '16px 16px 0 0',
            backgroundColor: 'primary.light',
            backgroundImage: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
            position: 'relative'
          }}
        />
        
        {/* Profile avatar */}
        <Avatar 
          src="https://placehold.co/150" 
          alt={userData.name}
          sx={{
            width: 150,
            height: 150,
            border: '4px solid #fff',
            position: 'absolute',
            left: 24,
            bottom: -75,
            boxShadow: 2
          }}
        />
        
        {/* Avatar edit button */}
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            left: 130,
            bottom: -40,
            bgcolor: 'background.paper',
            zIndex: 1,
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'background.paper',
              opacity: 0.9
            }
          }}
        >
          <CameraIcon fontSize="small" />
        </IconButton>
        
        {/* Profile Info */}
        <Box 
          sx={{ 
            ml: { xs: 0, sm: 20 }, 
            mt: { xs: 10, sm: 0 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {userData.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              {userData.email}
            </Typography>
            
            {userData.userType === 'recruiter' && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                {userData.company || 'Company not specified'} - {userData.position || 'Position not specified'}
              </Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={userData.userType === 'applier' ? 'Job Seeker' : 'Recruiter'} 
                color="primary" 
                variant="outlined" 
                size="small"
              />
            </Box>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ alignSelf: 'flex-start', mt: { xs: 2, md: 0 } }}
          >
            Edit Profile
          </Button>
        </Box>
        
        {/* Additional user details sections can go here */}
      </>
    );
  };
  
  // Company profile
  const renderCompanyProfile = () => {
    if (!companyData) return null;
    
    return (
      <>
        {/* Cover image */}
        <Box 
          sx={{ 
            height: 200, 
            borderRadius: '16px 16px 0 0',
            backgroundColor: 'secondary.light',
            backgroundImage: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
            position: 'relative'
          }}
        />
        
        {/* Company logo */}
        <Avatar 
          src={companyData.logoUrl || "https://placehold.co/150"} 
          alt={companyData.name}
          sx={{
            width: 150,
            height: 150,
            border: '4px solid #fff',
            position: 'absolute',
            left: 24,
            bottom: -75,
            boxShadow: 2
          }}
        />
        
        {/* Logo edit button */}
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            left: 130,
            bottom: -40,
            bgcolor: 'background.paper',
            zIndex: 1,
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'background.paper',
              opacity: 0.9
            }
          }}
        >
          <CameraIcon fontSize="small" />
        </IconButton>
        
        {/* Company Info */}
        <Box 
          sx={{ 
            ml: { xs: 0, sm: 20 }, 
            mt: { xs: 10, sm: 0 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {companyData.name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <EmailIcon fontSize="small" sx={{ mr: 1 }} />
              {companyData.email}
            </Typography>
            
            {companyData.address && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                {companyData.address}
              </Typography>
            )}
            
            {companyData.website && (
              <Typography 
                component="a"
                href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="body1" 
                color="primary" 
                sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  } 
                }}
              >
                {companyData.website}
              </Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                label="Company" 
                color="secondary" 
                variant="outlined" 
                size="small"
              />
            </Box>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ alignSelf: 'flex-start', mt: { xs: 2, md: 0 } }}
          >
            Edit Company Profile
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ position: 'relative', mb: 10 }}>
        {renderProfileContent()}
      </Box>
    </Container>
  );
};

export default Profile;