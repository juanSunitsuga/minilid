import React, { useState, useEffect } from 'react';
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
  CardActions,
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
  Chip,
  Grid,
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

// Mock job data (replace with API calls in production)
const jobListings = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "MiniLid Inc.",
    logo: "https://placehold.co/40",
    location: "Jakarta, Indonesia",
    type: "Full-time",
    salary: "Rp 10,000,000 - Rp 15,000,000 / month",
    postedDate: "2 days ago",
    description: "We're looking for an experienced Frontend Developer to join our team...",
    skills: ["React", "TypeScript", "CSS"],
    featured: true
  },
  {
    id: 2,
    title: "UX Designer",
    company: "Creative Solutions",
    logo: "https://placehold.co/40",
    location: "Remote",
    type: "Full-time",
    salary: "Rp 12,000,000 - Rp 18,000,000 / month",
    postedDate: "1 week ago",
    description: "Design user experiences for web and mobile applications...",
    skills: ["Figma", "User Research", "Prototyping"],
    featured: false
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "TechGrowth",
    logo: "https://placehold.co/40",
    location: "Bandung, Indonesia",
    type: "Contract",
    salary: "Rp 8,000,000 - Rp 12,000,000 / month",
    postedDate: "3 days ago",
    description: "Analyze large datasets to identify trends and insights...",
    skills: ["SQL", "Excel", "Data Visualization"],
    featured: false
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "Startup Hub",
    logo: "https://placehold.co/40",
    location: "Yogyakarta, Indonesia",
    type: "Full-time",
    salary: "Rp 15,000,000 - Rp 25,000,000 / month",
    postedDate: "Just now",
    description: "Develop and maintain server-side logic and APIs...",
    skills: ["Node.js", "MongoDB", "Express"],
    featured: true
  },
  {
    id: 5,
    title: "Product Manager",
    company: "Global Tech",
    logo: "https://placehold.co/40",
    location: "Jakarta, Indonesia",
    type: "Full-time",
    salary: "Rp 20,000,000 - Rp 30,000,000 / month",
    postedDate: "1 day ago",
    description: "Lead product development from concept to launch...",
    skills: ["Product Strategy", "Agile", "User Stories"],
    featured: false
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "Cloud Systems",
    logo: "https://placehold.co/40",
    location: "Remote",
    type: "Contract",
    salary: "Rp 18,000,000 - Rp 25,000,000 / month",
    postedDate: "5 days ago",
    description: "Implement and maintain CI/CD pipelines and cloud infrastructure...",
    skills: ["Docker", "Kubernetes", "AWS"],
    featured: false
  },
];

const Job: React.FC = () => {
  const theme = useTheme();
  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sort, setSort] = useState("newest");
  const [bookmarkedJobs, setBookmarkedJobs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Salary slider settings
  const [salaryRange, setSalaryRange] = useState<number[]>([5000000, 30000000]);
  const formatSalary = (value: number) => `Rp ${(value/1000000).toFixed(1)}M`;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Toggle job bookmark
  const toggleBookmark = (jobId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setBookmarkedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };
  
  // Toggle expanded job details
  const toggleJobExpand = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // Handle salary slider change
  const handleSalaryChange = (event: Event, newValue: number | number[]) => {
    setSalaryRange(newValue as number[]);
  };

  // Filter jobs based on all criteria
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesJobType = selectedJobType === "All" || job.type === selectedJobType;
    const matchesLocation = selectedLocation === "All" || job.location.includes(selectedLocation);
    
    // Parse salary from format "Rp 10,000,000 - Rp 15,000,000 / month"
    const minJobSalary = parseInt(job.salary.split(' - ')[0].replace(/[^0-9]/g, ''));
    const maxJobSalary = parseInt(job.salary.split(' - ')[1].replace(/[^0-9]/g, ''));
    
    const matchesSalary = 
      minJobSalary >= salaryRange[0] && maxJobSalary <= salaryRange[1];
    
    return matchesSearch && matchesJobType && matchesLocation && matchesSalary;
  });

  // Sort jobs based on selected criteria
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    } else if (sort === "oldest") {
      return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
    } else if (sort === "salaryAsc") {
      return parseInt(a.salary.split(' - ')[0].replace(/[^0-9]/g, '')) - parseInt(b.salary.split(' - ')[0].replace(/[^0-9]/g, ''));
    } else if (sort === "salaryDesc") {
      return parseInt(b.salary.split(' - ')[0].replace(/[^0-9]/g, '')) - parseInt(a.salary.split(' - ')[0].replace(/[^0-9]/g, ''));
    }
    return 0;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedJobType("All");
    setSelectedLocation("All");
    setSalaryRange([5000000, 30000000]);
    setSort("newest");
  };

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
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174) center/cover'
          }}
        />
        
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2, position: 'relative' }}>
          Find your dream job
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, position: 'relative' }}>
          Discover {jobListings.length} opportunities that match your skills and interests
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
        <Grid item xs={12} md={3}>
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
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Location</InputLabel>
              <Select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as string)}
                label="Location"
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <MenuItem value="All">All Locations</MenuItem>
                <MenuItem value="Jakarta">Jakarta</MenuItem>
                <MenuItem value="Bandung">Bandung</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
                <MenuItem value="Yogyakarta">Yogyakarta</MenuItem>
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
                  min={5000000}
                  max={30000000}
                  step={1000000}
                  marks={[
                    { value: 5000000, label: '5M' },
                    { value: 30000000, label: '30M' }
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
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.15)'
                  }
                }}
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
        <Grid item xs={12} md={9}>
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
                searchTerm || salaryRange[0] > 5000000 || salaryRange[1] < 30000000) && (
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
              minHeight: 500  // Ensure consistent height when loading
            }}>
              <CircularProgress />
            </Box>
          ) : sortedJobs.length > 0 ? (
            <Stack spacing={2} sx={{ minHeight: 500 }}>  {/* Add minimum height */}
              {sortedJobs.map((job, index) => (
                <Grow in={true} timeout={(index + 1) * 200} key={job.id}>
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
                      border: job.featured 
                        ? `1px solid ${theme.palette.primary.main}`
                        : '1px solid transparent'
                    }}
                  >
                    {job.featured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: 20,
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ pt: 3, pb: 1 }}>
                      <Box sx={{ display: 'flex' }}>
                        <Avatar 
                          src={job.logo} 
                          alt={job.company}
                          variant="rounded"
                          sx={{ 
                            width: 54, 
                            height: 54,
                            mr: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" component="h2" fontWeight="bold">
                              {job.title}
                            </Typography>
                            
                            <Tooltip title={bookmarkedJobs.includes(job.id) ? "Remove from saved jobs" : "Save job"}>
                              <IconButton 
                                size="small"
                                onClick={(e) => toggleBookmark(job.id, e)}
                                sx={{
                                  backgroundColor: bookmarkedJobs.includes(job.id) 
                                    ? 'rgba(3, 169, 244, 0.1)' 
                                    : 'transparent',
                                  '&:hover': {
                                    backgroundColor: bookmarkedJobs.includes(job.id) 
                                      ? 'rgba(3, 169, 244, 0.2)' 
                                      : 'rgba(0, 0, 0, 0.04)'
                                  }
                                }}
                              >
                                {bookmarkedJobs.includes(job.id) ? (
                                  <BookmarkIcon color="primary" />
                                ) : (
                                  <BookmarkBorder/>
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {job.company}
                          </Typography>
                          
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            sx={{ mt: 1, flexWrap: 'wrap', gap: 1, '& > *': { mb: 1 } }}
                          >
                            <Chip 
                              label={job.location} 
                              size="small" 
                              icon={<LocationIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                            />
                            <Chip 
                              label={job.type} 
                              size="small" 
                              icon={<WorkIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                            />
                            <Chip 
                              label={job.postedDate} 
                              size="small" 
                              icon={<ClockIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                            />
                            <Chip 
                              label={job.salary.split(' /')[0]} 
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
                        {job.description.length > 150 && expandedJobId !== job.id
                          ? `${job.description.substring(0, 150)}...` 
                          : job.description}
                      </Typography>
                      
                      {expandedJobId === job.id && (
                        <Fade in={expandedJobId === job.id}>
                          <Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Skills:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {job.skills.map(skill => (
                                  <Chip 
                                    key={skill} 
                                    label={skill} 
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
                          onClick={() => toggleJobExpand(job.id)}
                          endIcon={expandedJobId === job.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ textTransform: 'none' }}
                        >
                          {expandedJobId === job.id ? 'Show less' : 'Show more'}
                        </Button>
                        
                        <Box>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ mr: 1 }}
                          >
                            Details
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small"
                            sx={{
                              boxShadow: 'none',
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(3, 169, 244, 0.2)'
                              }
                            }}
                          >
                            Apply Now
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              ))}
            </Stack>
          ) : (
            // No results found - maintain consistent height
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
                minHeight: 500, // Important: keeps consistent height
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
              
              {/* Show what filters are currently applied */}
              {(selectedJobType !== "All" || selectedLocation !== "All" || 
                searchTerm || salaryRange[0] > 5000000 || salaryRange[1] < 30000000) && (
                <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.03)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current filters:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ '& > *': { mb: 1 } }}>
                    {searchTerm && (
                      <Chip label={`Search: "${searchTerm}"`} size="small" onDelete={() => setSearchTerm("")} />
                    )}
                    {selectedJobType !== "All" && (
                      <Chip label={`Job Type: ${selectedJobType}`} size="small" onDelete={() => setSelectedJobType("All")} />
                    )}
                    {selectedLocation !== "All" && (
                      <Chip label={`Location: ${selectedLocation}`} size="small" onDelete={() => setSelectedLocation("All")} />
                    )}
                    {(salaryRange[0] > 5000000 || salaryRange[1] < 30000000) && (
                      <Chip 
                        label={`Salary: ${formatSalary(salaryRange[0])} - ${formatSalary(salaryRange[1])}`} 
                        size="small" 
                        onDelete={() => setSalaryRange([5000000, 30000000])} 
                      />
                    )}
                  </Stack>
                </Box>
              )}
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
              >
                Load more jobs
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* Mobile action button for filters */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          right: 16, 
          display: { xs: 'block', md: 'none' },
          zIndex: 10
        }}
      >
        <Tooltip title="Toggle filters">
          <Button
            variant="contained"
            color="primary"
            sx={{ 
              minWidth: 'auto', 
              borderRadius: '50%', 
              p: 2,
              boxShadow: '0 4px 12px rgba(3, 169, 244, 0.4)'
            }}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Badge 
              badgeContent={
                (selectedJobType !== "All" ? 1 : 0) + 
                (selectedLocation !== "All" ? 1 : 0) + 
                (searchTerm ? 1 : 0) + 
                (salaryRange[0] > 5000000 || salaryRange[1] < 30000000 ? 1 : 0)
              } 
              color="error"
            >
              <FilterIcon />
            </Badge>
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Job;