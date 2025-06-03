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
  applier_id: string;
  name: string;
  email: string;
  about: string | null;
  skills?: Skill[];
}

interface Recruiter {
  recruiter_id: string;
  name: string;
  email: string;
  about: string | null;
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
  const [profileData, setProfileData] = useState<Applier | Recruiter | null>(null);
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
        
        const response = await FetchEndpoint(endpoint, 'GET', token, null);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch profile data');
        }
        
        setProfileData(data.data);
        
        // Only fetch skills if user is an applier
        if (userType === 'applier') {
          const skillsResponse = await FetchEndpoint(`/skills/appliers-skills?applier_id=${userId}`, 'GET', token, null);
          const skillsData = await skillsResponse.json();
          
          if (skillsResponse.ok) {
            setProfileData(prevData => {
              console.log('Current profile data:', prevData);
              if (!prevData) return null;

              return {
                ...prevData,
                skills: skillsData.data || []
              } as Applier;
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

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      let endpoint = '';
      if (userType === 'applier') {
        endpoint = `/profile/appliers/${userId}/about`;
      } else if (userType === 'recruiter') {
        endpoint = `/profile/recruiters/${userId}/about`;
      } else {
        throw new Error('Unknown user type');
      }

      const response = await FetchEndpoint(endpoint, 'POST', token, {
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

  // Handle skills update - only for appliers
  const handleUpdateSkills = async () => {
    // Refresh the profile data to get updated skills
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    if (token && userId && userType === 'applier') {
      try {
        const skillsResponse = await FetchEndpoint(`/skills/appliers-skills?applier_id=${userId}`, 'GET', token, null);
        const skillsData = await skillsResponse.json();
        
        if (skillsResponse.ok) {
          setProfileData(prevData => {
            if (!prevData) return null;
            return {
              ...prevData,
              skills: skillsData.data || []
            } as Applier;
          });
        }
      } catch (error) {
        console.error('Error refreshing skills:', error);
      }
    }
  };

  // Type guard functions
  const isApplier = (profile: Applier | Recruiter | null): profile is Applier => {
    return profile !== null && 'applier_id' in profile;
  };

  const isRecruiter = (profile: Applier | Recruiter | null): profile is Recruiter => {
    return profile !== null && 'recruiter_id' in profile;
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
          headline={userType === 'recruiter' ? "Recruiter" : "Student at Institut Teknologi Harapan Bangsa"}
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

        {/* Skills Section Component - Only show for appliers */}
        {userType === 'applier' && isApplier(profileData) && (
          <Skills 
            skills={profileData.skills || []}
            onUpdateSkills={handleUpdateSkills}
          />
        )}
        
        {/* Experience Section Component */}
        <ExperienceSection 
          experiences={experiences}
          userId={isApplier(profileData) ? profileData.applier_id : (isRecruiter(profileData) ? profileData.recruiter_id : undefined)}
          userType={userType as 'applier' | 'recruiter'}
          onAddExperience={() => console.log('Add experience clicked')}
        />

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