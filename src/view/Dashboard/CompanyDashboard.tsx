import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonRemove as RemoveIcon,
  SupervisorAccount as RecruiterIcon,
  Assessment as StatsIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonAdd as AddRecruiterIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';
import { Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

interface Recruiter {
  recruiter_id: string;
  company_id: string | null;
  name: string;
  email: string;
}

interface CompanyInfo {
  company_id: string;
  company_name: string;
  address: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
}

const CompanyDashboard: React.FC = () => {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [currentRecruiterId, setCurrentRecruiterId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const { userData } = useAuth();

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch company info
      const companyResponse = await FetchEndpoint('/company/profile', 'GET', token, null);
      
      if (!companyResponse.ok) {
        throw new Error('Failed to fetch company information');
      }
      
      const companyData = await companyResponse.json();
      setCompanyInfo(companyData.data);
      
      // Fetch recruiters for this company
      const recruitersResponse = await FetchEndpoint('/company/recruiters', 'GET', token, null);
      
      if (!recruitersResponse.ok) {
        throw new Error('Failed to fetch company recruiters');
      }
      
      const recruitersData = await recruitersResponse.json();
      setRecruiters(recruitersData.data || []);
    } catch (err: any) {
      console.error('Error fetching company data:', err);
      setError(err.message || 'An error occurred while fetching company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleRemoveRecruiter = async () => {
    if (!currentRecruiterId) return;
    
    setConfirmDialogOpen(false);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await FetchEndpoint(
        `/company/recruiters/${currentRecruiterId}/remove`, 
        'PUT', 
        token, 
        { company_id: null }
      );
      
      if (!response.ok) {
        throw new Error('Failed to remove recruiter');
      }
      
      // Update the local state
      setRecruiters(prev => prev.filter(r => r.recruiter_id !== currentRecruiterId));
      
      // Show success message
      setSnackbarMessage('Recruiter successfully removed from company');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (err: any) {
      console.error('Error removing recruiter:', err);
      setSnackbarMessage(err.message || 'Failed to remove recruiter');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const openConfirmDialog = (recruiterId: string) => {
    setCurrentRecruiterId(recruiterId);
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setCurrentRecruiterId(null);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Filter recruiters based on search term
  const filteredRecruiters = recruiters.filter(recruiter => 
    recruiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalRecruiters = recruiters.length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Company info header */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 2 }}>
        <Box sx={{ 
          width: { xs: 80, sm: 100 }, 
          height: { xs: 80, sm: 100 },
          bgcolor: 'grey.200', 
          borderRadius: '50%', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {companyInfo?.logo_url ? (
            <img 
              src={companyInfo.logo_url} 
              alt={companyInfo.company_name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <BusinessIcon fontSize="large" color="action" />
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {loading ? 'Loading...' : companyInfo?.company_name || 'Company Dashboard'}
          </Typography>
          {companyInfo && (
            <>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {companyInfo.address}
              </Typography>
              {companyInfo.website && (
                <Typography variant="body2" component="a" href={companyInfo.website} target="_blank" color="primary" sx={{ display: 'block', mb: 1, textDecoration: 'none' }}>
                  {companyInfo.website}
                </Typography>
              )}
            </>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: { xs: 2, sm: 1 } }}>
            <Button 
              variant="outlined" 
              size="small" 
              component={Link} 
              to="/company/profile/edit"
              startIcon={<EditIcon />}
            >
              Edit Profile
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              component={Link}
              to="/company/recruiters/invite"
              startIcon={<AddRecruiterIcon />}
            >
              Invite Recruiter
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards - Using Box with flexbox instead of Grid */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4 
        }}
      >
        {/* Recruiters */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', sm: '30%' }, 
          minWidth: { xs: '100%', sm: '250px' } 
        }}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <RecruiterIcon sx={{ fontSize: 40, color: 'primary.contrastText', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="primary.contrastText">
                {totalRecruiters}
              </Typography>
              <Typography variant="body2" color="primary.contrastText">
                Recruiters
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Total Jobs Posted */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', sm: '30%' }, 
          minWidth: { xs: '100%', sm: '250px' } 
        }}>
        </Box>

        {/* Active Applicants */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', sm: '30%' }, 
          minWidth: { xs: '100%', sm: '250px' } 
        }}>
         </Box>
      </Box>
      
      {/* Recruiters Management */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Recruiters Management
          </Typography>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchCompanyData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search recruiters by name or email"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : recruiters.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <RecruiterIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>No recruiters found</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your company doesn't have any recruiters yet.
              </Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to="/company/recruiters/invite"
                startIcon={<AddRecruiterIcon />}
                sx={{ mt: 1 }}
              >
                Invite Recruiters
              </Button>
            </Box>
          ) : filteredRecruiters.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1">No recruiters match your search.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Jobs Posted</strong></TableCell>
                    <TableCell><strong>Active Applicants</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecruiters.map((recruiter) => (
                    <TableRow key={recruiter.recruiter_id} hover>
                      <TableCell>
                        <Typography variant="body1">{recruiter.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          {recruiter.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Remove recruiter from company">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openConfirmDialog(recruiter.recruiter_id)}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View recruiter stats">
                          <IconButton 
                            size="small" 
                            color="primary"
                            component={Link}
                            to={`/company/recruiters/${recruiter.recruiter_id}`}
                          >
                            <StatsIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
      >
        <DialogTitle>Remove Recruiter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this recruiter from your company? 
            They will no longer be able to post jobs on behalf of your company.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button onClick={handleRemoveRecruiter} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompanyDashboard;