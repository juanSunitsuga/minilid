import React, { useContext } from 'react';
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
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  PhotoCamera as CameraIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  Language as WebsiteIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';
import { useAuth } from '../Context/AuthContext'; // Use the hook instead

const Profile: React.FC = () => {
  const { userData } = useAuth();
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ position: 'relative', mb: 10 }}>
        <Box 
          sx={{
            height: 200,
            borderRadius: 2,
            bgcolor: 'primary.main',
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
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {userData?.name || "Name Not Available"}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              {userData?.userType === 'recruiter' && userData?.position ? userData.position : "Title Not Available"} 
              {userData?.userType === 'recruiter' && userData?.company ? ` at ${userData.company}` : ""}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Location Not Available
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, md: 0 } }}>
            <Button variant="contained" startIcon={<EditIcon />}>
              Edit Profile
            </Button>
            <Button variant="outlined">
              More
            </Button>
          </Stack>
        </Box>
        
        {/* Company Badges */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mt: 3,
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
      
      {/* About Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
        <CardHeader
          title="About"
          action={
            <IconButton aria-label="edit">
              <EditIcon />
            </IconButton>
          }
          sx={{ pb: 0 }}
        />
        <CardContent>
          <Typography variant="body1">
            No information available.
          </Typography>
        </CardContent>
      </Card>
      
      {/* Experience Section - as requested, keeping this section as is */}
      <Card sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
        <CardHeader
          title="Experience"
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
            {/* First Job */}
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemAvatar sx={{ mr: 2 }}>
                <Avatar 
                  src="https://placehold.co/60" 
                  alt="Company Logo"
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="h6">Software Engineer</Typography>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" component="div">
                      MiniLid Inc. · Full-time
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jan 2021 - Present · 2 yrs 4 mos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Jakarta, Indonesia
                    </Typography>
                    <Typography variant="body2">
                      Developing and maintaining web applications using React, Node.js, 
                      and PostgreSQL. Leading a team of junior developers and mentoring them.
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            
            <Divider component="li" sx={{ my: 2 }} />
            
            {/* Second Job */}
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemAvatar sx={{ mr: 2 }}>
                <Avatar 
                  src="https://placehold.co/60" 
                  alt="Company Logo"
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="h6">Junior Developer</Typography>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" component="div">
                      Tech Solutions · Full-time
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jun 2018 - Dec 2020 · 2 yrs 7 mos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Jakarta, Indonesia
                    </Typography>
                    <Typography variant="body2">
                      Developed front-end interfaces using HTML, CSS, and JavaScript.
                      Collaborated with senior developers to implement new features.
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>
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
    </Container>
  );
};

export default Profile;