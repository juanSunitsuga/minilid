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
  Zoom,
  CircularProgress,
  Alert
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
  Search as SearchIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { FetchEndpoint } from './FetchEndpoint';

// Interface untuk job post dari API
interface JobPost {
  job_id: string;
  title: string;
  description: string;
  category: {
    category_id: number;
    name: string;
  };
  type: {
    type_id: number;
    name: string;
  };
  skills: {
    skill_id: number;
    name: string;
  }[];
  posted_date: string;
  recruiter_id?: string;
}

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Interactive state variables
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Job data state
  const [featuredJobs, setFeaturedJobs] = useState<JobPost[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format date to relative time (e.g., "2 days ago")
  const formatPostedDate = (dateString: string): string => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };
  
  // Fetch job posts from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await FetchEndpoint('/job/jobs', 'GET', null, null);
        
        if (!response.ok) {
          throw new Error('Failed to fetch job posts');
        }
        
        const jobs: JobPost[] = await response.json();
        console.log('Fetched jobs:', jobs);
        
        if (jobs.length > 0) {
          // Get 3 latest jobs for featured section
          setFeaturedJobs(jobs.slice(0, 3));
          
          // Get next 5 jobs for recent section
          setRecentJobs(jobs.length > 3 ? jobs.slice(3, 8) : []);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load job posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

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
  const toggleBookmark = (jobId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setBookmarkedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };
  
  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedJobs');
    if (savedBookmarks) {
      setBookmarkedJobs(JSON.parse(savedBookmarks));
    }
  }, []);
  
  // Save bookmarks to localStorage when updated
  useEffect(() => {
    if (bookmarkedJobs.length > 0) {
      localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs));
      // You could add toast notification here
      console.log('Job saved to bookmarks!');
    }
  }, [bookmarkedJobs]);
  
  // Card hover handler
  const handleCardHover = (jobId: string | null) => {
    setHighlightedCard(jobId);
  };
  
  // View job details handler
  const handleViewJobDetails = (jobId: string) => {
    navigate(`/job/${jobId}`);
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
          
          {/* More hero section code... */}
          
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
          
          {/* Jobs grid */}
          {!isLoading && !error && featuredJobs.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              margin: theme => theme.spacing(-1) 
            }}>
              {/* Job Cards */}
              {featuredJobs.map(job => (
                <Box 
                  key={job.job_id}
                  sx={{ 
                    width: { xs: '100%', sm: '50%', md: '33.33%' }, 
                    padding: 1.5
                  }}
                >
                  <Zoom in={true} style={{ transitionDelay: `${parseInt(job.job_id) * 0.1}ms` }}>
                    <Card 
                      onMouseEnter={() => handleCardHover(job.job_id)}
                      onMouseLeave={() => handleCardHover(null)}
                      onClick={() => handleViewJobDetails(job.job_id)}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        transform: highlightedCard === job.job_id ? 'translateY(-8px)' : 'none',
                        boxShadow: highlightedCard === job.job_id 
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
                          <Tooltip title={bookmarkedJobs.includes(job.job_id) ? "Remove bookmark" : "Save job"}>
                            <IconButton onClick={(e) => toggleBookmark(job.job_id, e)}>
                              {bookmarkedJobs.includes(job.job_id) ? (
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
                            {/* Company might not be in our data model yet */}
                            Company Name
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {/* Location might not be in our data model yet */}
                            Remote / On-site
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 3 }}>
                          <Chip 
                            icon={<WorkIcon sx={{ fontSize: '16px !important' }} />} 
                            label={job.type ? job.type.name : 'Job Type'} 
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
                            label={formatPostedDate(job.posted_date)} 
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              color: '#2E7D32',
                              fontWeight: 500,
                              borderRadius: 1
                            }}
                          />
                          {job.category && (
                            <Chip 
                              label={job.category.name} 
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                fontWeight: 500,
                                borderRadius: 1
                              }}
                            />
                          )}
                        </Box>
                        
                        {/* Skills chips */}
                        {job.skills && job.skills.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {job.skills.slice(0, 3).map(skill => (
                              <Chip 
                                key={skill.skill_id}
                                label={skill.name} 
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(156, 39, 176, 0.08)',
                                  color: '#7B1FA2',
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  borderRadius: 1
                                }}
                              />
                            ))}
                            {job.skills.length > 3 && (
                              <Chip 
                                label={`+${job.skills.length - 3}`} 
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(156, 39, 176, 0.04)',
                                  color: '#7B1FA2',
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  borderRadius: 1
                                }}
                              />
                            )}
                          </Box>
                        )}
                        
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
                          onClick={() => handleViewJobDetails(job.job_id)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>
              ))}
            </Box>
          )}
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
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : recentJobs.length > 0 ? (
            // Display recent jobs in a simpler format
            <Box>
              {recentJobs.map(job => (
                <Box 
                  key={job.job_id}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 2, 
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(3, 169, 244, 0.15)',
                      transform: 'translateX(5px)'
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => handleViewJobDetails(job.job_id)}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0277BD' }}>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {job.type && (
                        <Chip 
                          label={job.type.name} 
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(3, 169, 244, 0.1)',
                            color: '#0277BD',
                            height: 24,
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Posted {formatPostedDate(job.posted_date)}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    color="primary"
                    sx={{
                      borderRadius: 1.5,
                      minWidth: 100,
                      textTransform: 'none'
                    }}
                  >
                    View
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
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
                      component={Link}
                      to="/bookmarks"
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
          )}
        </Box>
      </Container>
    </>
  );
};

export default Home;