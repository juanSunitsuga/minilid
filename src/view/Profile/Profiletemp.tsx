import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  PhotoCamera as CameraIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  Language as WebsiteIcon,
  Twitter as TwitterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../Context/AuthContext';

// Define experience data type
interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  companyLogo?: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  description: string;
}

const Profile: React.FC = () => {
  const { userData, refreshUserData } = useAuth();
  
  // State for modal and form
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    position: userData?.userType === 'recruiter' ? userData?.position || '' : '',
    about: userData?.about || ''
  });
  
  // State for experience data
  const [experienceData, setExperienceData] = useState<ExperienceItem[]>([]);
  const [isLoadingExperience, setIsLoadingExperience] = useState(false);
  
  // Function to fetch user experience data
  const fetchUserExperience = async () => {
    if (!userData?.user_id) return;
    
    setIsLoadingExperience(true);
    try {
      // This would be your actual API call to fetch experience data
      // For example: const response = await axios.get(`/api/users/${userData.user_id}/experience`);
      
      // For demonstration, we'll simulate a request with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data - replace this with actual API call
      if (userData.userType === 'applier') {
        setExperienceData([
          {
            id: '1',
            position: 'Software Engineer',
            company: 'MiniLid Inc.',
            companyLogo: 'https://placehold.co/60',
            employmentType: 'Full-time',
            startDate: 'Jan 2021',
            endDate: 'Present',
            duration: '2 yrs 4 mos',
            location: 'Jakarta, Indonesia',
            description: 'Developing and maintaining web applications using React, Node.js, and PostgreSQL. Leading a team of junior developers and mentoring them.'
          },
          {
            id: '2',
            position: 'Junior Developer',
            company: 'Tech Solutions',
            companyLogo: 'https://placehold.co/60',
            employmentType: 'Full-time',
            startDate: 'Jun 2018',
            endDate: 'Dec 2020',
            duration: '2 yrs 7 mos',
            location: 'Jakarta, Indonesia',
            description: 'Developed front-end interfaces using HTML, CSS, and JavaScript. Collaborated with senior developers to implement new features.'
          }
        ]);
      } else {
        // If recruiter or other type, they might not have experience data
        setExperienceData([]);
      }
    } catch (error) {
      console.error('Error fetching user experience:', error);
      setExperienceData([]);
    } finally {
      setIsLoadingExperience(false);
    }
  };
  
  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        position: userData?.userType === 'recruiter' ? userData?.position || '' : '',
        about: userData?.about || ''
      });
    }
  }, [userData]);
  
  // Fetch experience data when component mounts or userData changes
  useEffect(() => {
    if (userData?.user_id) {
      fetchUserExperience();
    }
  }, [userData?.user_id]);
  
  // Handle form data changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Profile updated with:', formData);
      
      // Close modal after successful update
      setIsEditModalOpen(false);
      
      // Refresh user data
      if (refreshUserData) {
        await refreshUserData();
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function for empty state
  const EmptyState = ({ text }: { text: string }) => (
    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
      {text}
    </Typography>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Main Profile Content */}
      <Box sx={{ position: 'relative', mb: 10, boxShadow: 1, borderRadius: 2, overflow: 'hidden' }}>
        {/* Cover photo */}
        <Box 
          sx={{
            height: 200,
            bgcolor: 'primary.main',
            backgroundImage: 'linear-gradient(120deg, #2196f3 0%, #3f51b5 100%)',
            position: 'relative',
            mb: 8
          }}
        >
          <IconButton 
            sx={{ 
              position: 'absolute',
              right: 16,
              bottom: 16,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'background.paper',
                opacity: 0.9
              }
            }}
            size="small"
          >
            <CameraIcon />
          </IconButton>
        </Box>
        
        {/* Avatar and other existing elements */}
        <Avatar 
          src={"https://placehold.co/150"}
          alt={userData?.name || "Profile"}
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
        
        {/* Edit Profile Photo Button */}
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
        
        {/* Profile Info - improved styling */}
        <Box 
          sx={{ 
            ml: { xs: 0, sm: 20 }, 
            mt: { xs: 10, sm: 0 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            p: 3,
            backgroundColor: 'background.paper',
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {userData?.name || "Name Not Available"}
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
              {userData?.userType === 'recruiter' && userData?.position 
                ? userData.position 
                : userData?.userType === 'applier' ? "Job Seeker" : "Title Not Available"
              } 
              {userData?.userType === 'recruiter' && userData?.company ? ` at ${userData.company}` : ""}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, md: 0 }, alignSelf: 'flex-start' }}>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)}
              size="medium"
            >
              Edit Profile
            </Button>
            <Button variant="outlined" size="medium">
              More
            </Button>
          </Stack>
        </Box>
        
        {/* Company Badges - only show when data exists */}
        {(userData?.company || (userData?.education && userData?.education[0]?.institution)) && (
          <Box sx={{ 
            p: 3, 
            pt: 0, 
            backgroundColor: 'background.paper',
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2
          }}>
            <Stack 
              direction="row" 
              spacing={2} 
              sx={{ 
                ml: { xs: 0, sm: 20 }
              }}
            >
              {userData?.company && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={userData?.companyLogo || "https://placehold.co/40"} 
                    alt="Company logo"
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body2">{userData.company}</Typography>
                </Box>
              )}
              {userData?.education?.[0]?.institution && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={userData?.education?.[0]?.logo || "https://placehold.co/40"} 
                    alt="University logo"
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body2">{userData?.education[0].institution}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Box>
      
      {/* About Section - improved styling */}
      <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }} elevation={1}>
        <CardHeader
          title={<Typography variant="h6" fontWeight="medium">About</Typography>}
          action={
            <IconButton 
              aria-label="edit"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  about: userData?.about || ''
                }));
                setIsEditModalOpen(true);
              }}
            >
              <EditIcon />
            </IconButton>
          }
          sx={{ pb: 1, px: 3 }}
        />
        <CardContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body1">
            {userData?.about || "No information available."}
          </Typography>
        </CardContent>
      </Card>
      
      {/* Experience Section - updated with dynamic data */}
      <Card sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
        <CardHeader
          title={<Typography variant="h6" fontWeight="medium">Experience</Typography>}
          action={
            <Box>
              <IconButton size="small" sx={{ mr: 1 }}>
                <AddIcon />
              </IconButton>
              <IconButton size="small">
                <EditIcon />
              </IconButton>
            </Box>
          }
          sx={{ pb: 1, px: 3 }}
        />
        <CardContent sx={{ pt: 0, px: 3 }}>
          {isLoadingExperience ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : experienceData.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {experienceData.map((experience, index) => (
                <React.Fragment key={experience.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar sx={{ mr: 2 }}>
                      <Avatar 
                        src={experience.companyLogo || "https://placehold.co/60"} 
                        alt={`${experience.company} Logo`}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                          {experience.position}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle1" component="div">
                            {experience.company} · {experience.employmentType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {experience.startDate} - {experience.endDate} · {experience.duration}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {experience.location}
                          </Typography>
                          <Typography variant="body2">
                            {experience.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < experienceData.length - 1 && (
                    <Divider component="li" sx={{ my: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <EmptyState text="No experience information available" />
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                sx={{ mt: 2 }}
              >
                Add Experience
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Education Section - as requested, keeping this section as is */}
      <Card sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
        <CardHeader
          title="Education"
          action={
            <Box>
              <IconButton size="small" sx={{ mr: 1 }}>
                <AddIcon />
              </IconButton>
              <IconButton size="small">
                <EditIcon />
              </IconButton>
            </Box>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <List sx={{ width: '100%' }}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemAvatar sx={{ mr: 2 }}>
                <Avatar 
                  src="https://placehold.co/60" 
                  alt="University Logo"
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="h6">University of Indonesia</Typography>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" component="div">
                      Bachelor of Science in Computer Science
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      2014 - 2018
                    </Typography>
                    <Typography variant="body2">
                      Activities and societies: Computer Science Club, Hackathon Participant
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
      
      {/* Skills Section - as requested, keeping this section as is */}
      <Card sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
        <CardHeader
          title="Skills"
          action={
            <Box>
              <IconButton size="small" sx={{ mr: 1 }}>
                <AddIcon />
              </IconButton>
              <IconButton size="small">
                <EditIcon />
              </IconButton>
            </Box>
          }
        />
        <CardContent>
          {/* Replace Grid with flexbox */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            margin: theme => theme.spacing(-1) // Negative margin to compensate for padding
          }}>
            {/* JavaScript skill */}
            <Box sx={{ 
              width: { xs: '100%', sm: '50%', md: '33.33%' }, 
              padding: 1
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%' // Ensure even height
                }}
              >
                <Typography variant="h6" gutterBottom>JavaScript</Typography>
                <Typography variant="body2" color="text.secondary">7 endorsements</Typography>
              </Paper>
            </Box>
            
            {/* React.js skill */}
            <Box sx={{ 
              width: { xs: '100%', sm: '50%', md: '33.33%' }, 
              padding: 1
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom>React.js</Typography>
                <Typography variant="body2" color="text.secondary">15 endorsements</Typography>
              </Paper>
            </Box>
            
            {/* Node.js skill */}
            <Box sx={{ 
              width: { xs: '100%', sm: '50%', md: '33.33%' }, 
              padding: 1
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom>Node.js</Typography>
                <Typography variant="body2" color="text.secondary">12 endorsements</Typography>
              </Paper>
            </Box>
            
            {/* SQL skill */}
            <Box sx={{ 
              width: { xs: '100%', sm: '50%', md: '33.33%' }, 
              padding: 1
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom>SQL</Typography>
                <Typography variant="body2" color="text.secondary">8 endorsements</Typography>
              </Paper>
            </Box>
            
            {/* Git skill */}
            <Box sx={{ 
              width: { xs: '100%', sm: '50%', md: '33.33%' }, 
              padding: 1
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <Typography variant="h6" gutterBottom>Git</Typography>
                <Typography variant="body2" color="text.secondary">10 endorsements</Typography>
              </Paper>
            </Box>
          </Box>
          
          <Button 
            sx={{ mt: 2 }}
            variant="text"
          >
            Show all 12 skills
          </Button>
        </CardContent>
      </Card>
      
      {/* Edit Profile Modal - more refined */}
      <Modal
        open={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        aria-labelledby="edit-profile-modal"
        aria-describedby="modal-to-edit-user-profile"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2" fontWeight="medium">
              Edit Profile
            </Typography>
            <IconButton 
              onClick={() => !isSubmitting && setIsEditModalOpen(false)}
              disabled={isSubmitting}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            
            {userData?.userType === 'recruiter' && (
              <TextField
                fullWidth
                margin="normal"
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. HR Manager"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 1.5 }
                }}
              />
            )}
            
            <TextField
              fullWidth
              margin="normal"
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Jakarta, Indonesia"
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="About"
              name="about"
              value={formData.about}
              onChange={handleChange}
              disabled={isSubmitting}
              multiline
              rows={4}
              placeholder="Write a short introduction about yourself"
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ borderRadius: 2 }}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Container>
  );
};

export default Profile;