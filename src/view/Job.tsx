import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Avatar,
  Slide,
  Grow,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress,
  Fade,
  Slider,
  useTheme,
  Stack,
  Grid,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AccessTime as ClockIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder,
  FilterList as FilterIcon,
  Sort as SortIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SearchOff as SearchOffIcon
} from '@mui/icons-material';
import { FetchEndpoint } from './FetchEndpoint';

// ✅ UPDATED: Interface matching Home.tsx structure
interface JobPost {
  job_id: string;
  title: string;
  description: string;
  recruiter_id?: string;
  recruiter?: {
    recruiter_id: string;
    name: string;
    company_id: string;
    company?: {
      company_id: string;
      company_name: string;
      address: string;
    };
  };
  company?: {
    company_id: string;
    name: string;
    address: string;
  };
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
  // Salary fields
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  posted_date: string;
}

interface JobCategory {
  category_id: number;
  name: string;
}

interface JobType {
  type_id: number;
  name: string;
}

const Job: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Data from database
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [error, setError] = useState<string>('');
  
  // Salary slider settings
  const [salaryRange, setSalaryRange] = useState<number[]>([0, 50000000]);
  const formatSalary = (value: number) => `Rp ${(value/1000000).toFixed(1)}M`;

  // ✅ FIXED: Fetch data the same way as Home.tsx
  useEffect(() => {
    fetchJobData();
    loadBookmarksFromStorage();
  }, []);

  const fetchJobData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await FetchEndpoint('/job/jobs', 'GET', null, null);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job posts');
      }
      
      const jobs: JobPost[] = await response.json();
      console.log('Fetched jobs:', jobs);
      
      setJobPosts(jobs);
      
      // Extract unique categories from jobs
      const uniqueCategories = jobs
        .filter(job => job.category)
        .reduce((acc: JobCategory[], job) => {
          const exists = acc.find(cat => cat.category_id === job.category.category_id);
          if (!exists) {
            acc.push(job.category);
          }
          return acc;
        }, []);
      setJobCategories(uniqueCategories);
      
      // Extract unique job types from jobs
      const uniqueTypes = jobs
        .filter(job => job.type)
        .reduce((acc: JobType[], job) => {
          const exists = acc.find(type => type.type_id === job.type.type_id);
          if (!exists) {
            acc.push(job.type);
          }
          return acc;
        }, []);
      setJobTypes(uniqueTypes);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load job posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load bookmarks from localStorage
  const loadBookmarksFromStorage = () => {
    const savedBookmarks = localStorage.getItem('bookmarkedJobs');
    if (savedBookmarks) {
      setBookmarkedJobs(JSON.parse(savedBookmarks));
    }
  };

  // Save bookmarks to localStorage
  const saveBookmarksToStorage = (bookmarks: string[]) => {
    localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));
  };

  // Toggle job bookmark
  const toggleBookmark = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const newBookmarks = bookmarkedJobs.includes(jobId) 
      ? bookmarkedJobs.filter(id => id !== jobId) 
      : [...bookmarkedJobs, jobId];
    
    setBookmarkedJobs(newBookmarks);
    saveBookmarksToStorage(newBookmarks);
  };
  
  // Toggle expanded job details
  const toggleJobExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // Handle salary slider change
  const handleSalaryChange = (event: Event, newValue: number | number[]) => {
    setSalaryRange(newValue as number[]);
  };

  // ✅ UPDATED: Format salary display using same logic as Home.tsx
  const formatSalaryDisplay = (job: JobPost): string => {
    const { salary_min, salary_max, salary_type } = job;
    
    if (!salary_min && !salary_max) {
      return 'Salary negotiable';
    }

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('id-ID').format(num);
    };

    const typeLabel = {
      hourly: '/hour',
      daily: '/day', 
      monthly: '/month',
      yearly: '/year'
    }[salary_type || 'monthly'];

    if (salary_min && salary_max) {
      return `Rp ${formatNumber(salary_min)} - ${formatNumber(salary_max)}${typeLabel}`;
    } else if (salary_min) {
      return `From Rp ${formatNumber(salary_min)}${typeLabel}`;
    } else if (salary_max) {
      return `Up to Rp ${formatNumber(salary_max)}${typeLabel}`;
    }

    return 'Negotiable';
  };

  // ✅ UPDATED: Format date display using same logic as Home.tsx
  const formatDate = (dateString: string) => {
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

  // ✅ UPDATED: Filter jobs based on new data structure
  const filteredJobs = jobPosts.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (job.company?.name && job.company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skills && job.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase())));
      
    const matchesJobType = selectedJobType === "All" || job.type?.name === selectedJobType;
    const matchesLocation = selectedLocation === "All" || 
      (job.company?.address && job.company.address.toLowerCase().includes(selectedLocation.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || job.category?.name === selectedCategory;
    
    const matchesSalary = 
      (!job.salary_min || job.salary_min >= salaryRange[0]) && 
      (!job.salary_max || job.salary_max <= salaryRange[1]);
    
    return matchesSearch && matchesJobType && matchesLocation && matchesCategory && matchesSalary;
  });

  // Sort jobs based on selected criteria
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
    } else if (sort === "oldest") {
      return new Date(a.posted_date).getTime() - new Date(b.posted_date).getTime();
    } else if (sort === "salaryAsc") {
      return (a.salary_min || 0) - (b.salary_min || 0);
    } else if (sort === "salaryDesc") {
      return (b.salary_min || 0) - (a.salary_min || 0);
    }
    return 0;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedJobType("All");
    setSelectedLocation("All");
    setSelectedCategory("All");
    setSalaryRange([0, 50000000]);
    setSort("newest");
  };

  // Navigate to job detail page
  const handleViewJob = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  if (error) {
    return (
      <Box sx={{
        width: '1200px',
        height: '800px',
        margin: '20px auto',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchJobData} startIcon={<RefreshIcon />}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '1200px',
      height: '800px',
      margin: '20px auto',
      padding: '20px',
      position: 'relative',
      overflow: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      borderRadius: theme.shape.borderRadius * 2,
      backgroundColor: theme.palette.background.default,
    }}>
      {/* Page Header */}
      <Box 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          position: 'relative',
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(3, 169, 244, 0.8) 0%, rgba(0, 188, 212, 0.8) 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2, position: 'relative' }}>
          Find your dream job
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, position: 'relative' }}>
          Discover {jobPosts.length} opportunities that match your skills and interests
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex',
            maxWidth: '600px',
            mx: 'auto',
            backgroundColor: 'white',
            borderRadius: 2,
            p: 0.5,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
        >
          <TextField
            variant="standard"
            placeholder="Search by job title, company, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              disableUnderline: true,
              sx: { px: 1, py: 0.5 }
            }}
          />
          <Button 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 1 }}
          >
            Search
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left sidebar with filters */}
        <Grid item xs={12} md={3} sx={{ mr: 100 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              position: { xs: 'relative', md: 'sticky' },
              top: { md: '20px' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterIcon sx={{ mr: 1 }} /> Filters
              </Typography>
              <Tooltip title="Reset all filters">
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={resetFilters}
                  sx={{ 
                    backgroundColor: 'rgba(3, 169, 244, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(3, 169, 244, 0.2)',
                    }
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Job Type</InputLabel>
              <Select 
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value as string)}
                label="Job Type"
              >
                <MenuItem value="All">All Types</MenuItem>
                {jobTypes.map(type => (
                  <MenuItem key={type.type_id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Category</InputLabel>
              <Select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as string)}
                label="Category"
              >
                <MenuItem value="All">All Categories</MenuItem>
                {jobCategories.map(category => (
                  <MenuItem key={category.category_id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Location</InputLabel>
              <Select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as string)}
                label="Location"
              >
                <MenuItem value="All">All Locations</MenuItem>
                <MenuItem value="Jakarta">Jakarta</MenuItem>
                <MenuItem value="Bandung">Bandung</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
                <MenuItem value="Yogyakarta">Yogyakarta</MenuItem>
                <MenuItem value="Surabaya">Surabaya</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Salary Range
              </Typography>
              <Box sx={{ px: 1, pt: 1 }}>
                <Slider
                  value={salaryRange}
                  onChange={handleSalaryChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatSalary}
                  min={0}
                  max={50000000}
                  step={1000000}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 50000000, label: '50M' }
                  ]}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {formatSalary(salaryRange[0])}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatSalary(salaryRange[1])}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Sort by</InputLabel>
              <Select 
                value={sort}
                onChange={(e) => setSort(e.target.value as string)}
                label="Sort by"
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="salaryAsc">Salary: low to high</MenuItem>
                <MenuItem value="salaryDesc">Salary: high to low</MenuItem>
              </Select>
            </FormControl>
            
            {bookmarkedJobs.length > 0 && (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<BookmarkIcon />}
                fullWidth
                sx={{ mt: 3 }}
              >
                View {bookmarkedJobs.length} saved jobs
              </Button>
            )}
          </Paper>
        </Grid>
        
        {/* Right side with job listings */}
        <Grid item xs={12} md={9} sx={{ ml: 45, mt: -78}}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
            pb: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="medium">
                {sortedJobs.length} job results
              </Typography>
              
              {(selectedJobType !== "All" || selectedLocation !== "All" || 
                selectedCategory !== "All" || searchTerm || 
                salaryRange[0] > 0 || salaryRange[1] < 50000000) && (
                <Chip 
                  label="Filters applied" 
                  size="small" 
                  color="primary"
                  onDelete={resetFilters}
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                Sort by:
              </Typography>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as string)}
                variant="standard"
                size="small"
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="salaryAsc">Salary: low to high</MenuItem>
                <MenuItem value="salaryDesc">Salary: high to low</MenuItem>
              </Select>
            </Box>
          </Box>
          
          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              py: 10,
              minHeight: 500
            }}>
              <CircularProgress />
            </Box>
          ) : sortedJobs.length > 0 ? (
            <Stack spacing={2} sx={{ minHeight: 500 }}>
              {sortedJobs.map((job, index) => (
                <Grow in={true} timeout={(index + 1) * 200} key={job.job_id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewJob(job.job_id)}
                  >
                    <CardContent sx={{ pt: 3, pb: 1 }}>
                      <Box sx={{ display: 'flex' }}>
                        <Avatar 
                          variant="rounded"
                          sx={{ 
                            width: 54, 
                            height: 54,
                            mr: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            bgcolor: 'primary.main'
                          }}
                        >
                          {job.company?.name ? job.company.name.charAt(0).toUpperCase() : 'C'}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="h2" fontWeight="bold">
                              {job.title}
                            </Typography>
                            
                            <Tooltip title={bookmarkedJobs.includes(job.job_id) ? "Remove from saved jobs" : "Save job"}>
                              <IconButton 
                                size="small"
                                onClick={(e) => toggleBookmark(job.job_id, e)}
                                sx={{
                                  backgroundColor: bookmarkedJobs.includes(job.job_id) 
                                    ? 'rgba(3, 169, 244, 0.1)' 
                                    : 'transparent',
                                  '&:hover': {
                                    backgroundColor: bookmarkedJobs.includes(job.job_id) 
                                      ? 'rgba(3, 169, 244, 0.2)' 
                                      : 'rgba(0, 0, 0, 0.04)'
                                  }
                                }}
                              >
                                {bookmarkedJobs.includes(job.job_id) ? (
                                  <BookmarkIcon color="primary" />
                                ) : (
                                  <BookmarkBorder/>
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {job.company?.name || job.recruiter?.name || 'Company'}
                          </Typography>
                          
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            sx={{ mt: 1, flexWrap: 'wrap', gap: 1, '& > *': { mb: 1 } }}
                          >
                            {job.company?.address && (
                              <Chip 
                                label={job.company.address} 
                                size="small" 
                                icon={<LocationIcon fontSize="small" />}
                                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                              />
                            )}
                            {job.type && (
                              <Chip 
                                label={job.type.name} 
                                size="small" 
                                icon={<WorkIcon fontSize="small" />}
                                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                              />
                            )}
                            {job.category && (
                              <Chip 
                                label={job.category.name} 
                                size="small" 
                                icon={<WorkIcon fontSize="small" />}
                                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                              />
                            )}
                            <Chip 
                              label={formatDate(job.posted_date)} 
                              size="small" 
                              icon={<ClockIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                            />
                            <Chip 
                              label={formatSalaryDisplay(job)} 
                              size="small" 
                              icon={<MoneyIcon fontSize="small" />}
                              color="primary"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {job.description.length > 150 && expandedJobId !== job.job_id
                          ? `${job.description.substring(0, 150)}...` 
                          : job.description}
                      </Typography>
                      
                      {expandedJobId === job.job_id && job.skills && job.skills.length > 0 && (
                        <Fade in={expandedJobId === job.job_id}>
                          <Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Skills:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {job.skills.map((skill, index) => (
                                  <Chip 
                                    key={index} 
                                    label={skill.name} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: 'rgba(3, 169, 244, 0.1)',
                                      color: '#0277BD',
                                      fontWeight: 500,
                                      borderRadius: 1
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Fade>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Button 
                          variant="text" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleJobExpand(job.job_id);
                          }}
                          endIcon={expandedJobId === job.job_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ textTransform: 'none' }}
                        >
                          {expandedJobId === job.job_id ? 'Show less' : 'Show more'}
                        </Button>
                        
                        <Box>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ mr: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewJob(job.job_id);
                            }}
                          >
                            Details
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              ))}
            </Stack>
          ) : (
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
                minHeight: 500,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <SearchOffIcon sx={{ fontSize: 60, color: 'rgba(0, 0, 0, 0.2)', mb: 2 }} />
              <Typography variant="h5" gutterBottom fontWeight="medium">
                No jobs match your search criteria
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                Try adjusting your filters or search term to see more results
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
                size="large"
              >
                Reset All Filters
              </Button>
            </Paper>
          )}
          
          {sortedJobs.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ 
                  px: 4,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(3, 169, 244, 0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={fetchJobData}
              >
                Refresh Jobs
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Job;