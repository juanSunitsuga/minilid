import React, { useState, useEffect } from 'react';
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
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Visibility, 
  VisibilityOff,
  PersonOutline,
  EmailOutlined,
  LockOutlined,
  AccountCircle
} from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';
import { useAuth } from '../Context/AuthContext';
import { motion } from 'framer-motion';

interface EditProfileProps {
  open: boolean;
  onClose: () => void;
  userData: any;
  onProfileUpdate: (updatedData: any) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-edit-tabpanel-${index}`}
      aria-labelledby={`profile-edit-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const EditProfile: React.FC<EditProfileProps> = ({
  open,
  onClose,
  userData,
  onProfileUpdate
}) => {
  const { userType } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
        currentPassword: ''
      });
    }
  }, [userData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Clear form data when switching tabs
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      password: '',
      confirmPassword: ''
    }));
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setShowCurrentPassword(!showCurrentPassword);
    else if (field === 'new') setShowPassword(!showPassword);
    else setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = (section: string) => {
    setError(null);

    // Always require current password
    if (!formData.currentPassword) {
      setError("Please enter your current password to verify changes");
      return false;
    }

    if (section === 'name') {
      if (!formData.name.trim()) {
        setError("Name is required");
        return false;
      }
    } 
    else if (section === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
    } 
    else if (section === 'password') {
      if (!formData.password) {
        setError("New password is required");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (section: string) => {
    if (!validateForm(section)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data based on which section is being updated
      const dataToSubmit: any = { 
        currentPassword: formData.currentPassword 
      };
      
      if (section === 'name') {
        dataToSubmit.name = formData.name;
      } 
      else if (section === 'email') {
        dataToSubmit.email = formData.email;
      }
      else if (section === 'password') {
        dataToSubmit.password = formData.password;
      }

      // Get the correct user ID based on user type
      let userId;
      if (userType === 'recruiter') {
        userId = userData.recruiter_id || userData.id;
      } else {
        userId = userData.applier_id || userData.id;
      }

      // Use the correct endpoint based on user type
      const endpoint = userType === 'recruiter' 
        ? `/profile/recruiters/${userId}` 
        : `/profile/appliers/${userId}`;
      
      console.log('Submitting to endpoint:', endpoint);
      console.log('Data:', dataToSubmit);
      
      const response = await FetchEndpoint(
        endpoint, 
        'PUT', 
        token, 
        dataToSubmit
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        password: section === 'password' ? '' : prev.password,
        confirmPassword: section === 'password' ? '' : prev.confirmPassword
      }));

      // Set success message
      setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`);
      
      // Update parent component with new data
      if (data.data) {
        onProfileUpdate(data.data);
      }
      
      // Auto-navigate back to overview after successful update (except for password)
      if (section !== 'password') {
        setTimeout(() => {
          setActiveTab(0);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error(`Error updating ${section}:`, error);
      setError(error.message || `Failed to update ${section}`);
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
        component: motion.div,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider' 
      }}>
        <Typography variant="h6" component="div" fontWeight="600">
          Edit Profile
        </Typography>
        {!isSubmitting && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            px: 2,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            },
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              py: 2,
              mx: 0.5,
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.3s ease',
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
                transform: 'translateY(-1px)',
              },
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'rgba(33, 150, 243, 0.04)',
                fontWeight: 600,
              },
              '& .MuiTab-iconWrapper': {
                marginRight: 1,
                marginBottom: 0,
                fontSize: '1.1rem',
              },
            },
          }}
        >
          <Tab 
            icon={<AccountCircle />}
            iconPosition="start"
            label="Overview" 
          />
          <Tab 
            icon={<PersonOutline />}
            iconPosition="start"
            label="Name" 
          />
          <Tab 
            icon={<EmailOutlined />}
            iconPosition="start"
            label="Email" 
          />
          <Tab 
            icon={<LockOutlined />}
            iconPosition="start"
            label="Password" 
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            {success}
          </Alert>
        )}

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="600">Name</Typography>
              <Button 
                size="small" 
                onClick={() => setActiveTab(1)} 
                sx={{ textTransform: 'none' }}
              >
                Edit
              </Button>
            </Box>
            <Typography>{formData.name || 'Not set'}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="600">Email</Typography>
              <Button 
                size="small" 
                onClick={() => setActiveTab(2)} 
                sx={{ textTransform: 'none' }}
              >
                Edit
              </Button>
            </Box>
            <Typography>{formData.email || 'Not set'}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="600">Password</Typography>
              <Button 
                size="small" 
                onClick={() => setActiveTab(3)} 
                sx={{ textTransform: 'none' }}
              >
                Change
              </Button>
            </Box>
            <Typography>••••••••</Typography>
          </Paper>
        </TabPanel>

        {/* Name Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box component="form" noValidate>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                Verification Required
              </Typography>
            </Divider>

            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel htmlFor="currentPassword">Current Password</InputLabel>
              <OutlinedInput
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                required
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle current password visibility"
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Current Password"
                sx={{ borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                Please enter your current password to confirm this change
              </Typography>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="outlined"
                onClick={() => setActiveTab(0)}
                disabled={isSubmitting}
                sx={{ 
                  mr: 2,
                  borderRadius: 2, 
                  px: 3
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={() => handleSubmit('name')}
                disabled={isSubmitting || !formData.name || !formData.currentPassword}
                sx={{ 
                  borderRadius: 2, 
                  px: 3
                }}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Email Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box component="form" noValidate>
            <TextField
              required
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                Verification Required
              </Typography>
            </Divider>

            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel htmlFor="currentPassword">Current Password</InputLabel>
              <OutlinedInput
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                required
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle current password visibility"
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Current Password"
                sx={{ borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                Please enter your current password to confirm this change
              </Typography>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="outlined"
                onClick={() => setActiveTab(0)}
                disabled={isSubmitting}
                sx={{ 
                  mr: 2,
                  borderRadius: 2, 
                  px: 3
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={() => handleSubmit('email')}
                disabled={isSubmitting || !formData.email || !formData.currentPassword}
                sx={{ 
                  borderRadius: 2, 
                  px: 3
                }}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Password Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box component="form" noValidate>
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel htmlFor="password">New Password</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="New Password"
                sx={{ borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                Minimum 8 characters
              </Typography>
            </FormControl>

            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel htmlFor="confirmPassword">Confirm New Password</InputLabel>
              <OutlinedInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Confirm New Password"
                sx={{ borderRadius: 2 }}
              />
            </FormControl>

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                Verification Required
              </Typography>
            </Divider>

            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel htmlFor="currentPassword">Current Password</InputLabel>
              <OutlinedInput
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                required
                startAdornment={
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle current password visibility"
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Current Password"
                sx={{ borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                Please enter your current password to confirm this change
              </Typography>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="outlined"
                onClick={() => setActiveTab(0)}
                disabled={isSubmitting}
                sx={{ 
                  mr: 2,
                  borderRadius: 2, 
                  px: 3
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={() => handleSubmit('password')}
                disabled={
                  isSubmitting || 
                  !formData.password || 
                  !formData.confirmPassword ||
                  !formData.currentPassword
                }
                sx={{ 
                  borderRadius: 2, 
                  px: 3
                }}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>

      {activeTab === 0 && (
        <DialogActions sx={{ px: 3, py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            variant="contained"
            onClick={onClose}
            sx={{ 
              borderRadius: 2, 
              px: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 600,
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default EditProfile;