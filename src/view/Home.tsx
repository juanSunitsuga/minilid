import React, { useState, useEffect } from 'react';
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
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Fade,
  Zoom
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  AttachMoney as SalaryIcon,
  Visibility as ViewsIcon,
  KeyboardDoubleArrowDown as ScrollIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  
  // Interactive state variables
  const [bookmarkedJobs, setBookmarkedJobs] = useState<number[]>([]);
  const [highlightedCard, setHighlightedCard] = useState<number | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated job data
  const featuredJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "MiniLid Inc.",
      location: "Jakarta, Indonesia",
      salary: "$3,000 - $5,000",
      posted: "2 days ago",
      views: 243
    },
    {
      id: 2,
      title: "UX Designer",
      company: "Creative Solutions",
      location: "Remote",
      salary: "$4,000 - $6,000",
      posted: "1 week ago",
      views: 187
    },
    {
      id: 3,
      title: "Data Analyst",
      company: "TechGrowth",
      location: "Bandung, Indonesia",
      salary: "$2,800 - $4,200",
      posted: "3 days ago",
      views: 156
    }
  ];
  
  // Scroll indicator hiding effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollIndicator(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle bookmark job
  const toggleBookmark = (jobId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setBookmarkedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };
  
  // Effect to show notification when a job is bookmarked
  useEffect(() => {
    if (bookmarkedJobs.length > 0) {
      // You could add toast notification here
      console.log('Job saved to bookmarks!');
    }
  }, [bookmarkedJobs]);
  
  // Card hover handler
  const handleCardHover = (jobId: number | null) => {
    setHighlightedCard(jobId);
  };
  
  return (
    <>
      {/* Sky blue gradient background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'linear-gradient(135deg, #B3E5FC 0%, #4FC3F7 50%, #03A9F4 100%)',
        }}
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
        {/* Hero Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 3 }, 
            mb: 5, 
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            },
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              color: '#1565C0',
              textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            Welcome to MiniLid
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4, 
              maxWidth: '700px', 
              mx: 'auto',
              color: '#0277BD'
            }}
          >
            Your gateway to exciting career opportunities and professional growth
          </Typography>
          
          {/* Interactive search box */}
          <Box 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              mb: 5,
              position: 'relative',
              transform: searchFocus ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 3,
              px: 2,
              boxShadow: searchFocus 
                ? '0 8px 32px rgba(3, 169, 244, 0.2)' 
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
            </Box>
            
            {searchQuery && (
              <Box sx={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0,
                mt: 1,
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                p: 2,
                zIndex: 10
              }}>
                {['Frontend Developer', 'UX Design', 'Data Science']
                  .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((suggestion, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 1.5, 
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(3, 169, 244, 0.1)'
                        }
                      }}
                    >
                      <Typography variant="body1">{suggestion}</Typography>
                    </Box>
                ))}
              </Box>
            )}
          </Box>
          
          {/* Animated scroll down indicator */}
          <Fade in={showScrollIndicator}>
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0) translateX(-50%)',
                  },
                  '40%': {
                    transform: 'translateY(-15px) translateX(-50%)',
                  },
                  '60%': {
                    transform: 'translateY(-7px) translateX(-50%)',
                  }
                }
              }}
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            >
              <Typography variant="body2" sx={{ color: '#1565C0', fontWeight: 500, mb: 1 }}>
                Explore Jobs
              </Typography>
              <IconButton 
                size="small" 
                sx={{ 
                  backgroundColor: 'white', 
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <ScrollIcon />
              </IconButton>
            </Box>
          </Fade>
        </Paper>

        {/* Featured Jobs Section */}
        <Box 
          sx={{ 
            mb: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                color: '#0277BD',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 60,
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1.5
                }
              }}
            >
              Featured Jobs
            </Typography>
            <Button 
              component={Link}
              to="/jobs"
              color="primary" 
              endIcon={<TrendingIcon />}
              sx={{ 
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateX(4px)'
                }
              }}
            >
              View All
            </Button>
          </Box>
          <Divider sx={{ mb: 3, opacity: 0.7 }} />
          
          {/* Flexbox container instead of Grid */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            margin: theme => theme.spacing(-1.5) 
          }}>
            {/* Job Cards */}
            {featuredJobs.map(job => (
              <Box 
                key={job.id}
                sx={{ 
                  width: { xs: '100%', sm: '50%', md: '33.33%' }, 
                  padding: 1.5
                }}
              >
                <Zoom in={true} style={{ transitionDelay: `${job.id * 100}ms` }}>
                  <Card 
                    onMouseEnter={() => handleCardHover(job.id)}
                    onMouseLeave={() => handleCardHover(null)}
                    onClick={() => { /* job details navigation */ }}
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      transform: highlightedCard === job.id ? 'translateY(-8px)' : 'none',
                      boxShadow: highlightedCard === job.id 
                        ? '0 10px 25px rgba(3, 169, 244, 0.2)'
                        : '0 2px 10px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 10px 25px rgba(3, 169, 244, 0.2)',
                      }
                    }}
                  >
                    <CardHeader
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0277BD' }}>
                          {job.title}
                        </Typography>
                      }
                      action={
                        <Tooltip title={bookmarkedJobs.includes(job.id) ? "Remove bookmark" : "Save job"}>
                          <IconButton onClick={(e) => toggleBookmark(job.id, e)}>
                            {bookmarkedJobs.includes(job.id) ? (
                              <BookmarkIcon 
                                color="primary" 
                                sx={{ 
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.15)'
                                  }
                                }} 
                              />
                            ) : (
                              <BookmarkBorderIcon 
                                sx={{ 
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.15)'
                                  }
                                }} 
                              />
                            )}
                          </IconButton>
                        </Tooltip>
                      }
                    />
                    <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.company}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 3 }}>
                        <Chip 
                          icon={<SalaryIcon sx={{ fontSize: '16px !important' }} />} 
                          label={job.salary} 
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(3, 169, 244, 0.1)',
                            color: '#0277BD',
                            fontWeight: 500,
                            borderRadius: 1
                          }}
                        />
                        <Chip 
                          icon={<TimerIcon sx={{ fontSize: '16px !important' }} />} 
                          label={job.posted} 
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            color: '#2E7D32',
                            fontWeight: 500,
                            borderRadius: 1
                          }}
                        />
                        <Tooltip title="Job views">
                          <Chip 
                            icon={<ViewsIcon sx={{ fontSize: '16px !important' }} />} 
                            label={`${job.views} views`} 
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              fontWeight: 500,
                              borderRadius: 1
                            }}
                          />
                        </Tooltip>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        color="primary"
                        disableElevation
                        fullWidth
                        sx={{
                          mt: 2,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 10px rgba(3, 169, 244, 0.3)',
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>
            ))}
          </Box>
        </Box>
        
        {/* Recent Jobs Section */}
        <Box 
          sx={{ 
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              color: '#0277BD',
              position: 'relative',
              mb: 2,
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 3,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 1.5
              }
            }}
          >
            Recent Opportunities
          </Typography>
          <Divider sx={{ mb: 3, opacity: 0.7 }} />
          
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" sx={{ color: '#0277BD', mb: 2 }}>
              More exciting jobs coming soon!
            </Typography>
            <Button 
              component={Link}
              to="/jobs"
              variant="outlined" 
              color="primary"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'rgba(3, 169, 244, 0.1)',
                }
              }}
            >
              Browse All Jobs
            </Button>
            
            {/* Bookmarks indicator */}
            {bookmarkedJobs.length > 0 && (
              <Box sx={{ mt: 3, animation: 'fadeIn 0.5s ease-in-out' }}>
                <Badge badgeContent={bookmarkedJobs.length} color="primary">
                  <Button
                    variant="text"
                    color="primary"
                    startIcon={<BookmarkIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    View Saved Jobs
                  </Button>
                </Badge>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Home;