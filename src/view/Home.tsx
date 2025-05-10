import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  CardHeader,
  Button,
  Divider,
  useTheme,
  Paper
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to MiniLid
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Your job search platform
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          sx={{ fontWeight: 'bold', px: 4 }}
        >
          Find Jobs
        </Button>
      </Paper>

      {/* Featured Jobs Section */}
      <Box sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold">
            Featured Jobs
          </Typography>
          <Button 
            color="primary" 
            endIcon={<TrendingIcon />}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* Flexbox container instead of Grid */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          margin: theme => theme.spacing(-1.5) 
        }}>
          {/* Job Card 1 */}
          <Box sx={{ 
            width: { xs: '100%', sm: '50%', md: '33.33%' }, 
            padding: 1.5
          }}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardHeader
                title="Frontend Developer"
                action={
                  <BookmarkIcon 
                    color="primary" 
                    sx={{ cursor: 'pointer' }} 
                  />
                }
              />
              <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    MiniLid Inc.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Jakarta, Indonesia
                  </Typography>
                </Box>
                <Button variant="outlined" fullWidth>View Details</Button>
              </CardContent>
            </Card>
          </Box>

          {/* Job Card 2 */}
          <Box sx={{ 
            width: { xs: '100%', sm: '50%', md: '33.33%' }, 
            padding: 1.5
          }}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardHeader
                title="UX Designer"
                action={
                  <BookmarkIcon 
                    color="action" 
                    sx={{ cursor: 'pointer' }} 
                  />
                }
              />
              <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Creative Solutions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Remote
                  </Typography>
                </Box>
                <Button variant="outlined" fullWidth>View Details</Button>
              </CardContent>
            </Card>
          </Box>

          {/* Job Card 3 */}
          <Box sx={{ 
            width: { xs: '100%', sm: '50%', md: '33.33%' }, 
            padding: 1.5
          }}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardHeader
                title="Data Analyst"
                action={
                  <BookmarkIcon 
                    color="action" 
                    sx={{ cursor: 'pointer' }} 
                  />
                }
              />
              <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    TechGrowth
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Bandung, Indonesia
                  </Typography>
                </Box>
                <Button variant="outlined" fullWidth>View Details</Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
      
      {/* Recent Jobs Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Recent Opportunities
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {/* You can add more job cards or another layout section here */}
      </Box>
    </Container>
  );
};

export default Home;