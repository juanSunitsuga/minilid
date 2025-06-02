import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  Chip, 
  Avatar,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Email as EmailIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';
import PageTransition from '../Components/PageTransition';

// Interfaces - matching the backend response structure
interface Applier {
  applier_id: string;
  name: string;
  email: string;
  about: string | null;
  skills?: Skill[];
  experiences?: Experience[];
}

interface Skill {
  skill_id: number;
  name: string;
}

interface Experience {
  experience_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  description?: string;
}

interface Application {
  id: number;
  job_title: string;
  company_name: string;
  applied_date: string;
  status: string;
  interview_date?: string;
}

const ViewProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profileData, setProfileData] = useState<Applier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  // Helper function to format date range
  const formatDateRange = (startDate: string, endDate: string | null): string => {
    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        });
      } catch {
        return dateString;
      }
    };

    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    return `${start} - ${end}`;
  };

  // Fetch profile data using the correct endpoint
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('User ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Fetching profile for user:', userId);
        
        // Use the /profile/appliers/:id endpoint that includes skills and experiences
        const response = await FetchEndpoint(`/profile/appliers/${userId}`, 'GET', null, null);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User profile not found');
          }
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        console.log('✅ Complete profile data from /appliers/:id:', data);
        
        if (!data.data) {
          throw new Error('Profile data not found');
        }
        
        // The endpoint already includes skills and experiences via associations
        const applierData = data.data;
        
        // Map skills to match our interface (backend uses 'name', frontend expects 'skill_name')
        if (applierData.skills) {
          applierData.skills = applierData.skills.map((skill: any) => ({
            skill_id: skill.skill_id,
            skill_name: skill.name // Map 'name' to 'skill_name'
          }));
        }
        
        // Map experiences to include formatted data
        if (applierData.experiences) {
          applierData.experiences = applierData.experiences.map((exp: any) => ({
            ...exp,
            title: exp.job_title, // Map job_title to title for display
            company: exp.company_name, // Map company_name to company for display
            duration: formatDateRange(exp.start_date, exp.end_date)
          }));
        }
        
        setProfileData(applierData);
        
        // Fetch applications data separately (might be private)
        try {
          const applicationsResponse = await FetchEndpoint(`/profile/applications?applier_id=${userId}`, 'GET', null, null);
          
          if (applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json();
            console.log('✅ Applications data:', applicationsData);
            setApplications(applicationsData.data || []);
          } else {
            console.log('ℹ️ Applications data is private or not available');
            setApplications([]);
          }
        } catch (applicationsError) {
          console.log('ℹ️ Applications data not available (might be private):', applicationsError);
          setApplications([]);
        }
        
      } catch (error: any) {
        console.error('❌ Error fetching profile:', error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  // Function to determine chip color based on status
  const getStatusChipProps = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return {
          bgcolor: 'rgba(25, 118, 210, 0.08)', 
          color: 'primary.main'
        };
      case 'interviewing':
        return {
          bgcolor: 'rgba(255, 152, 0, 0.08)', 
          color: 'warning.dark'
        };
      case 'hired':
        return {
          bgcolor: 'rgba(76, 175, 80, 0.08)', 
          color: 'success.dark'
        };
      case 'rejected':
        return {
          bgcolor: 'rgba(211, 47, 47, 0.08)', 
          color: 'error.main'
        };
      default:
        return {
          bgcolor: 'rgba(0, 0, 0, 0.08)', 
          color: 'text.primary'
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading profile...
          </Typography>
        </Container>
      </PageTransition>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <PageTransition>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Profile not found'}
          </Alert>
        </Container>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Container maxWidth="md" sx={{ pt: 2, pb: 6 }}>
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 3, 
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="600" gutterBottom>
                  {profileData.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body1" color="text.secondary">
                    {profileData.email}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body1" color="text.secondary">
                    Student at Institut Teknologi Harapan Bangsa
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* About Section */}
        {profileData.about && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                mb: 3,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
                About
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.7,
                  color: 'text.primary',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {profileData.about}
              </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Skills Section */}
        {profileData.skills && profileData.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                mb: 3,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {profileData.skills.map((skill, index) => (
                  <Chip
                    key={skill.skill_id || index}
                    label={skill.skill_name || skill.name}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}

        {/* Experience Section */}
        {profileData.experiences && profileData.experiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                mb: 3,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
                Experience
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {profileData.experiences.map((exp, index) => (
                  <Card 
                    key={exp.experience_id || index}
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 2,
                      borderColor: 'divider'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WorkIcon color="primary" fontSize="small" />
                        <Typography variant="h6" fontWeight="600">
                          {exp.title || exp.job_title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {exp.company || exp.company_name} • {exp.duration}
                      </Typography>
                      
                      {exp.description && (
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {exp.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}

        {/* Job Applications Section */}
        {applications && applications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                mb: 3,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
                Job Applications
              </Typography>
              
              <Grid container spacing={2}>
                {applications.map((app) => (
                  <Grid item xs={12} sm={6} key={app.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 2, 
                        borderColor: 'divider', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%'
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="500" sx={{ mb: 1 }}>
                          {app.job_title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {app.company_name}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            label={app.status} 
                            variant="outlined" 
                            size="small"
                            sx={getStatusChipProps(app.status)}
                          />
                          
                          <Chip 
                            label={`Applied on ${app.applied_date}`} 
                            variant="outlined" 
                            size="small"
                            color="default"
                          />
                          
                          {app.interview_date && (
                            <Chip 
                              label={`Interview on ${app.interview_date}`} 
                              variant="outlined" 
                              size="small"
                              color="default"
                            />
                          )}
                        </Box>
                      </CardContent>
                      
                      <Divider />
                      
                      <Box sx={{ p: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          fullWidth
                          startIcon={<ViewIcon />}
                          sx={{ 
                            borderRadius: 2, 
                            py: 1.5, 
                            fontSize: '0.875rem',
                            textTransform: 'none'
                          }}
                          disabled
                        >
                          View Only
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        )}

        {/* Empty State */}
        {(!profileData.skills || profileData.skills.length === 0) && 
         (!profileData.about) && 
         (!profileData.experiences || profileData.experiences.length === 0) && 
         (!applications || applications.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 6, 
                borderRadius: 3, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                This profile is still being built
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The user hasn't added detailed information yet.
              </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              © 2025 MiniLid Corporation • Privacy Policy • Terms of Service • Cookie Policy
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </PageTransition>
  );
};

export default ViewProfile;