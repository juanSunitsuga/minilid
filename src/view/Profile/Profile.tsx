import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, Divider, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../Context/AuthContext';
import PageTransition from '../Components/PageTransition';
import { FetchEndpoint } from '../FetchEndpoint';

// Import separated components
import ProfileHeader from './ProfileHeader';
import About from './About';
import Skills from './Skills';
import ExperienceSection from './Experience';
import EditProfile from './EditProfile';

// Interface based on appliers.ts model
interface Applier {
  applier_id: string;  // Keep this required
  name: string;        // Keep this required
  email: string;       // Keep this required
  about: string | null;
  skills?: Skill[];    // Make this optional
}

interface Skill {
  skill_id: number;
  skill_name: string;
}

interface Experience {
  id?: number;
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Application {
  id: number;
  job_title: string;
  company_name: string;
  applied_date: string;
  status: string;
  interview_date?: string;
}

const Profile: React.FC = () => {
  const { isAuthenticated, userData, userType } = useAuth();
  const [profileData, setProfileData] = useState<Applier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      job_title: "Frontend Developer",
      company_name: "MiniLid Inc.",
      applied_date: "May 15, 2023",
      status: "Applied"
    },
    {
      id: 2,
      job_title: "UX Designer",
      company_name: "Creative Solutions",
      applied_date: "May 10, 2023",
      status: "Interviewing",
      interview_date: "May 30"
    }
  ]);

  // Fetch profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        // Use the correct endpoint based on user type
        const endpoint = userType === 'recruiter'
          ? `/profile/recruiters/${userId}`
          : `/profile/appliers/${userId}`;
        
        const response = await FetchEndpoint(endpoint, 'GET', token);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch profile data');
        }
        
        setProfileData(data.data);
        
        // Also fetch skills if needed
        if (userType === 'applier') {
          const skillsResponse = await FetchEndpoint(`/profile/appliers-skills?applier_id=${userId}`, 'GET', token);
          const skillsData = await skillsResponse.json();
          
          
          if (skillsResponse.ok) {
            setProfileData(prevData => {
              console.log('Current profile data:', prevData);
              if (!prevData) return null;

              return {
                applier_id: prevData.applier_id,
                name: prevData.name,
                email: prevData.email,
                about: prevData.about,
                skills: skillsData.data || []
              };
            });
          }
        }
        
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && userType) {
      fetchUserProfile();
    }
  }, [isAuthenticated, userType]);

  // Handle about section update
  const handleSaveAbout = async (aboutText: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await FetchEndpoint(`/profile/appliers/${profileData?.applier_id}/about`, 'POST', token, {
        about: aboutText
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      if (profileData) {
        setProfileData({
          ...profileData,
          about: aboutText
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Handle skills update
  const handleUpdateSkills = async (skillNames: string[]) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Update local state with new skills
      if (profileData) {
        const updatedSkills = skillNames.map((name, index) => ({
          skill_id: index, // This is just a placeholder; backend would assign real IDs
          skill_name: name
        }));
        
        setProfileData({
          ...profileData,
          skills: updatedSkills
        });
      }
    } catch (error: any) {
      console.error('Error updating skills:', error);
      throw new Error(error.message || 'Failed to update skills');
    }
  };

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

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <PageTransition>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4">Please log in to view your profile</Typography>
        </Container>
      </PageTransition>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <PageTransition>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5">Loading profile...</Typography>
        </Container>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Container maxWidth="md" sx={{ pt: 2, pb: 6 }}>
        {/* Profile Header Component */}
        <ProfileHeader 
          name={profileData?.name || ""}
          email={profileData?.email}
          headline="Student at Institut Teknologi Harapan Bangsa"
        //   profilePicture={profileData?.profile_picture}
          userData={profileData}
          onProfileUpdate={(updatedData) => {
            setProfileData({
              ...profileData,
              ...updatedData
            });
          }}
        />

        {/* About Section Component */}
        <About 
          about={profileData?.about || ""}
          onSave={handleSaveAbout}
        />

        {/* Skills Section Component */}
        <Skills 
          skills={profileData?.skills || []}
          onUpdateSkills={handleUpdateSkills}
        />
        
        {/* Experience Section Component */}
        <ExperienceSection 
          experiences={experiences}
          userId={profileData?.applier_id}
          userType={userType as 'applier' | 'recruiter'}
          onAddExperience={() => console.log('Add experience clicked')}
        />
        
        {/* Job Applications Section - Using existing components */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>Job Applications</Typography>
            
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
                        variant="contained" 
                        size="small" 
                        fullWidth
                        sx={{ 
                          borderRadius: 2, 
                          py: 1.5, 
                          fontSize: '0.875rem' 
                        }}
                        onClick={() => console.log('View details clicked')}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              © 2023 MiniLid Corporation • Privacy Policy • Terms of Service • Cookie Policy
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </PageTransition>
  );
};

export default Profile;