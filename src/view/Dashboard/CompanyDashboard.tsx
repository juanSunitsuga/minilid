import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Avatar,
  Grid,
  styled,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Tooltip,
  Divider,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  SupervisorAccount as RecruiterIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  PersonAdd as AddRecruiterIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  DeleteForever as DeleteCompanyIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CompanyInfo {
  company_id: string;
  company_name: string;
  address: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  company_email?: string;
  recruiterCount?: number;
  jobPostCount?: number;
  recruiters?: Recruiter[];
}

interface Recruiter {
  recruiter_id: string;
  name: string;
  email: string;
  company_id: string | null;
  created_at: string;
}

interface CompanyStats {
  active_recruiter: number;
  active_jobs: number;
}

// Clean, modern styled components
const ProfileCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0077b5 0%, #005885 100%)',
  color: 'white',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 20px 40px rgba(0,119,181,0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
    zIndex: 1,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.2)',
  marginBottom: '24px',
  overflow: 'hidden'
}));

const CompanyDashboard: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  
  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editAddress, setEditAddress] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editLoading, setEditLoading] = useState<boolean>(false);
  
  // Delete company dialog state
  const [deleteCompanyDialogOpen, setDeleteCompanyDialogOpen] = useState<boolean>(false);

  const { userData, companyData, logout } = useAuth();
  const navigate = useNavigate();

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userType = localStorage.getItem('userType');
      
      if (userType !== 'company') {
        throw new Error('Access denied: Company account required');
      }

      console.log('Fetching company profile...');
      
      const profileResponse = await FetchEndpoint(`/company/profile/${companyData?.id}`, 'GET', null, null);
      
      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Company API Error:', errorText);
        throw new Error(`Failed to fetch company profile: ${profileResponse.status}`);
      }
      
      const profileData = await profileResponse.json();
      console.log('Profile data received:', profileData);
      setCompanyInfo(profileData.data);
      
      // Set recruiters from the response
      if (profileData.data && profileData.data.recruiters) {
        setRecruiters(profileData.data.recruiters);
      }

      setCompanyStats({
        active_recruiter: profileData.recruiterCount || 0,
        active_jobs: profileData.jobPostCount || 0,
      });

      console.log('Company stats:', profileData.recruiterCount, profileData.jobPostCount);
      
    } catch (err: any) {
      console.error('Error fetching company data:', err);
      setError(err.message || 'An error occurred while fetching company data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecruiter = async (recruiter: Recruiter) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await FetchEndpoint(
        `/profile/recruiters/${recruiter.recruiter_id}`, 
        'PUT', 
        token, 
        {} // Send empty object instead of null
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Remove recruiter error:', errorData);
        throw new Error('Failed to remove recruiter');
      }
      
      // Remove recruiter from local state
      setRecruiters(prev => prev.filter(r => r.recruiter_id !== recruiter.recruiter_id));
      
      // Update company stats
      setCompanyStats(prev => prev ? {
        ...prev,
        active_recruiter: Math.max(0, prev.active_recruiter - 1)
      } : null);
      
      setSnackbarMessage(`${recruiter.name} has been removed from the company`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (err: any) {
      console.error('Error removing recruiter:', err);
      setSnackbarMessage(err.message || 'Failed to remove recruiter');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRecruiter(null);
    }
  };

  const handleEditCompany = async () => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await FetchEndpoint(
        `/company/${companyData?.id}`, 
        'PUT', 
        token, 
        {
          address: editAddress,
          description: editDescription
        }
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Update company error:', errorData);
        throw new Error('Failed to update company');
      }
      
      // Update local state
      setCompanyInfo(prev => prev ? {
        ...prev,
        address: editAddress,
        description: editDescription
      } : null);
      
      setSnackbarMessage('Company information updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setEditDialogOpen(false);
      
    } catch (err: any) {
      console.error('Error updating company:', err);
      setSnackbarMessage(err.message || 'Failed to update company');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await FetchEndpoint(
        `/company/${companyData?.id}`, 
        'DELETE', 
        token, 
        null
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete company error:', errorData);
        throw new Error('Failed to delete company');
      }
      
      setSnackbarMessage('Company deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Logout and redirect after a short delay
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error deleting company:', err);
      setSnackbarMessage(err.message || 'Failed to delete company');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteCompanyDialogOpen(false);
    }
  };

  const openEditDialog = () => {
    setEditAddress(companyInfo?.address || '');
    setEditDescription(companyInfo?.description || '');
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditAddress('');
    setEditDescription('');
  };

  const openDeleteDialog = (recruiter: Recruiter) => {
    setSelectedRecruiter(recruiter);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedRecruiter(null);
  };

  const openDeleteCompanyDialog = () => {
    setDeleteCompanyDialogOpen(true);
  };

  const closeDeleteCompanyDialog = () => {
    setDeleteCompanyDialogOpen(false);
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Header with Company Settings */}
      <HeaderCard>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
              Company Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your company profile and team
            </Typography>
          </Box>
          
          {/* Company Settings Menu */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Company Settings">
              <IconButton
                onClick={openEditDialog}
                sx={{ 
                  bgcolor: 'rgba(0,119,181,0.1)',
                  color: '#0077b5',
                  '&:hover': { 
                    bgcolor: 'rgba(0,119,181,0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete Company">
              <IconButton
                onClick={openDeleteCompanyDialog}
                sx={{ 
                  bgcolor: 'rgba(211,47,47,0.1)',
                  color: '#d32f2f',
                  '&:hover': { 
                    bgcolor: 'rgba(211,47,47,0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <DeleteCompanyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </HeaderCard>

      {/* Company Profile Card */}
      <ProfileCard sx={{ mb: 4 }}>
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, position: 'relative', zIndex: 3 }}>
            {/* Company Logo */}
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'rgba(255,255,255,0.15)',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
              src={companyInfo?.logo_url}
            >
              <BusinessIcon sx={{ fontSize: 50 }} />
            </Avatar>
            
            {/* Company Info */}
            <Box sx={{ flex: 1, color: 'white' }}>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {companyInfo?.company_name || 'Your Company'}
              </Typography>
              
              <Chip 
                label={companyInfo?.industry || 'Technology'} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  mb: 2,
                  fontWeight: 600
                }} 
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3, opacity: 0.95 }}>
                {companyInfo?.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" />
                    <Typography variant="body1">{companyInfo.address}</Typography>
                  </Box>
                )}
                {companyInfo?.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WebsiteIcon fontSize="small" />
                    <Typography 
                      variant="body1" 
                      component="a" 
                      href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`} 
                      target="_blank"
                      sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {companyInfo.website.replace(/^https?:\/\//, '')}
                    </Typography>
                  </Box>
                )}
                {companyInfo?.company_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body1">{companyInfo.company_email}</Typography>
                  </Box>
                )}
              </Box>
              
              {companyInfo?.description && (
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
                  {companyInfo.description}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </ProfileCard>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '16px', 
                bgcolor: '#0077b5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <RecruiterIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#0077b5" sx={{ mb: 1 }}>
                {companyStats?.active_recruiter || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Active Recruiters
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StatsCard>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '16px', 
                bgcolor: '#10a37f', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <WorkIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#10a37f" sx={{ mb: 1 }}>
                {companyStats?.active_jobs || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Active Jobs
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>
      
      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(211,47,47,0.15)'
          }}
        >
          {error}
        </Alert>
      )}
      
      {/* Team Management Section */}
      <StatsCard sx={{ overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          bgcolor: '#fafbfc'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Team Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage your company recruiters
              </Typography>
            </Box>
            <ActionButton 
              startIcon={<RefreshIcon />} 
              onClick={fetchCompanyData}
              disabled={loading}
              variant="outlined"
              size="small"
            >
              Refresh
            </ActionButton>
          </Box>
        </Box>
        
        {/* Recruiters List */}
        {recruiters && recruiters.length > 0 ? (
          <Box sx={{ p: 3 }}>
            <List sx={{ p: 0 }}>
              {recruiters.map((recruiter, index) => (
                <React.Fragment key={recruiter.recruiter_id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#0077b5', width: 48, height: 48 }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight={600}>
                          {recruiter.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {recruiter.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Joined: {new Date(recruiter.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Remove recruiter">
                        <IconButton
                          edge="end"
                          onClick={() => openDeleteDialog(recruiter)}
                          sx={{ 
                            color: '#d32f2f',
                            '&:hover': { 
                              bgcolor: 'rgba(211, 47, 47, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recruiters.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: '#f5f7fa', 
              mx: 'auto', 
              mb: 3
            }}>
              <RecruiterIcon sx={{ fontSize: 40, color: '#6b7280' }} />
            </Avatar>
            <Typography variant="h6" gutterBottom fontWeight={600} color="text.primary">
              No Recruiters Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Your company doesn't have any recruiters yet. Start building your recruitment team by inviting team members.
            </Typography>
            <ActionButton 
              variant="contained" 
              startIcon={<AddRecruiterIcon />}
              onClick={() => {
                setSnackbarMessage('Invite recruiters feature coming soon');
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
              }}
            >
              Invite First Recruiter
            </ActionButton>
          </Box>
        )}
      </StatsCard>
      
      {/* Edit Company Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle id="edit-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            Edit Company Information
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Company Address"
            fullWidth
            variant="outlined"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            margin="dense"
            label="Company Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Tell us about your company, culture, and values..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={closeEditDialog}
            startIcon={<CancelIcon />}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <ActionButton 
            onClick={handleEditCompany}
            variant="contained"
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Delete Recruiter Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Remove Recruiter
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <strong>{selectedRecruiter?.name}</strong> from your company? 
            This will remove their association with your company, but their account will remain active.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDeleteDialog} sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button 
            onClick={() => selectedRecruiter && handleDeleteRecruiter(selectedRecruiter)} 
            color="error"
            variant="contained"
            sx={{ borderRadius: '8px' }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog
        open={deleteCompanyDialogOpen}
        onClose={closeDeleteCompanyDialog}
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ color: '#d32f2f' }}>
          <Typography variant="h6" fontWeight="bold">
            ⚠️ Delete Company
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            This action cannot be undone!
          </Alert>
          <DialogContentText>
            Are you sure you want to permanently delete <strong>{companyInfo?.company_name}</strong>? 
            This will remove:
          </DialogContentText>
          <Box component="ul" sx={{ mt: 2, pl: 2 }}>
            <li>Company profile and information</li>
            <li>All associated recruiters</li>
            <li>All job postings</li>
            <li>All application data</li>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDeleteCompanyDialog} sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCompany}
            color="error"
            variant="contained"
            startIcon={<DeleteCompanyIcon />}
            sx={{ borderRadius: '8px' }}
          >
            Delete Company
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompanyDashboard;