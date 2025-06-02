import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Button, Paper, Stack, IconButton, CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon, PhotoCamera
} from '@mui/icons-material';
import EditProfile from './EditProfile';
import { FetchEndpoint } from '../FetchEndpoint';
import { useAuth } from '../Context/AuthContext';

interface ProfileHeaderProps {
  onProfileUpdate?: (updatedData: any) => void;
  userData?: any;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onProfileUpdate,
  userData: initialUserData
}) => {
  const { userType } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(initialUserData || {});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }

        // Determine which endpoint to call based on user type
        const endpoint = userType === 'recruiter'
          ? `/profile/recruiters/${userId}`
          : `/profile/appliers/${userId}`;

        const response = await FetchEndpoint(endpoint, 'GET', token, null);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile data');
        }

        const responseData = await response.json();
        setProfileData(responseData.data);

        // If onProfileUpdate is provided, call it with the fetched data
        if (onProfileUpdate) {
          onProfileUpdate(responseData.data);
        }
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        setError(error.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data only if no initial user data was provided
    if ((!initialUserData || Object.keys(initialUserData).length === 0) && userType) {
      fetchProfileData();
    } else if (initialUserData) {
      setProfileData(initialUserData);
    }
  }, [userType, onProfileUpdate, initialUserData]);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleProfileUpdate = (updatedData: any) => {
    setProfileData((prev: any) => ({ ...prev, ...updatedData }));

    if (onProfileUpdate) {
      onProfileUpdate(updatedData);
    }
  };

  const { name, email, about, profile_picture } = profileData;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        mb: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        width: '100%',
        position: 'relative'  // Added for positioning the edit button
      }}
    >
      {/* Edit Button - Float at top right */}
      <IconButton
        aria-label="edit profile"
        onClick={handleOpenEditModal}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'white',
          zIndex: 10,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.9)'
          }
        }}
      >
        <EditIcon />
      </IconButton>

      {/* Cover Photo */}
      <Box
        sx={{
          height: 200,
          bgcolor: 'background.default',
          position: 'relative',
          backgroundImage: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%'
        }}
      >
      </Box>

      {/* Profile info section */}
      <Box sx={{ position: 'relative', px: 3, pb: 3, width: '100%' }}>
        {/* Profile Photo with Loading State and Edit Button */}
        <Box sx={{ position: 'relative' }}>
          {isLoading ? (
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '4px solid #fff',
                position: 'absolute',
                top: -75,
                left: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.paper'
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Avatar
                src={profile_picture || "https://placehold.co/200"}
                alt={name || "User"}
                sx={{
                  width: 150,
                  height: 150,
                  border: '4px solid #fff',
                  position: 'absolute',
                  top: -75,
                  left: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                {name?.charAt(0) || "U"}
              </Avatar>
            </>
          )}
        </Box>

        {/* Profile Header */}
        <Box
          sx={{
            pt: 9,
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Box sx={{ maxWidth: '70%' }}>
            {/* Name and Verification with Loading State */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isLoading ? (
                <CircularProgress size={24} sx={{ my: 2 }} />
              ) : (
                <Typography variant="h4" fontWeight="600" paddingTop={1.5}>
                  {name || "User Name"}
                </Typography>
              )}
            </Box>

            {/* Headline */}
            <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
              {userType === 'applier' ? "I am an Applier" : "I am a Recruiter"}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            {/* You could add additional content here if needed */}
          </Box>
        </Box>
      </Box>

      {/* Edit Profile Modal */}
      {profileData && Object.keys(profileData).length > 0 && (
        <EditProfile
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          userData={profileData}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </Paper>
  );
};

export default ProfileHeader;