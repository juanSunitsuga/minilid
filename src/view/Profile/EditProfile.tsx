import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Avatar
} from '@mui/material';
import { Close as CloseIcon, PhotoCamera } from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';

interface EditProfileProps {
  open: boolean;
  onClose: () => void;
  userData: {
    applier_id: string;
    name: string;
    email: string;
    about: string | null;
    profilePicture?: string;
  };
  onProfileUpdate: (updatedData: any) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({
  open,
  onClose,
  userData,
  onProfileUpdate
}) => {
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    about: userData.about || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await FetchEndpoint(
        `/profile/appliers/${userData.applier_id}`, 
        'PUT', 
        token, 
        formData
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      onProfileUpdate(data.data);
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          Edit Profile
        </Typography>
        {!isSubmitting && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Profile Picture */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={userData.profilePicture || "https://placehold.co/200"}
                  alt={userData.name}
                  sx={{ width: 120, height: 120 }}
                >
                  {userData.name?.charAt(0)}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' },
                    border: '1px solid #ddd'
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="name"
                name="name"
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="email"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="about"
                name="about"
                label="About"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={formData.about}
                onChange={handleChange}
                placeholder="Write a brief description about yourself"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={isSubmitting}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{ borderRadius: 2, px: 3 }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfile;