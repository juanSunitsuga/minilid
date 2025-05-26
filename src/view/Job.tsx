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
  Divider,
  FormControl,
  InputLabel,
  Avatar,
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
  Category as CategoryIcon,
  AccessTime as ClockIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SearchOff as SearchOffIcon,
  Close as CloseIcon,
  TuneOutlined as TuneIcon,
  SortOutlined as SortIcon
} from '@mui/icons-material';
import axios from 'axios';

// Interface based on your JobPosts model
interface JobPost {
  id: number;
  title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  job_type: string;
  category: string;
  min_salary: number;
  max_salary: number;
  posted_date: string;
  description: string;
  skills: string[];
  is_featured: boolean;
}

// Interface for job types based on your JobTypes model
interface JobType {
  id: number;
  name: string;
}

// Interface for job categories based on your JobCategories model
interface JobCategory {
  id: number;
  name: string;
}

const Job: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sort, setSort] = useState("newest");
  const [bookmarkedJobs, setBookmarkedJobs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filter dialog/drawer state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  // Temporary filter states (for applying only when user clicks "Apply")
  const [tempJobType, setTempJobType] = useState("All");
  const [tempCategory, setTempCategory] = useState("All");
  const [tempLocation, setTempLocation] = useState("All");
  const [tempSalaryRange, setTempSalaryRange] = useState<number[]>([5000000, 30000000]);
  
  // Salary slider settings
  const [salaryRange, setSalaryRange] = useState<number[]>([5000000, 30000000]);
  const formatSalary = (value: number) => `Rp ${(value/1000000).toFixed(1)}M`;

  // Handle opening filter dialog/drawer
  const openFilterDialog = () => {
    // Set temporary filter states to current filter states
    setTempJobType(selectedJobType);
    setTempCategory(selectedCategory);
    setTempLocation(selectedLocation);
    setTempSalaryRange([...salaryRange]);
    setFilterDialogOpen(true);
  };

  // Handle closing filter dialog/drawer
  const closeFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  // Handle applying filters
  const applyFilters = () => {
    setSelectedJobType(tempJobType);
    setSelectedCategory(tempCategory);
    setSelectedLocation(tempLocation);
    setSalaryRange([...tempSalaryRange]);
    closeFilterDialog();
  };

  // Toggle sort dialog
  const toggleSortDialog = () => {
    setSortDialogOpen(!sortDialogOpen);
  };

  // Load job data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, replace with API calls
        // Example: const response = await axios.get('/api/jobs');
        
        // For now, use mock data aligned with your model structure
        setJobPosts([
          {
            id: 1,
            title: "Frontend Developer",
            company_name: "MiniLid Inc.",
            company_logo: "https://placehold.co/60",
            location: "Jakarta, Indonesia",
            job_type: "Full-time",
            category: "IT & Software",
            min_salary: 10000000,
            max_salary: 15000000,
            posted_date: "2023-05-24", // 2 days ago
            description: "We're looking for an experienced Frontend Developer to join our team. You'll be responsible for building user interfaces using React and TypeScript. Must have 2+ years of experience with modern frontend frameworks.",
            skills: ["React", "TypeScript", "CSS"],
            is_featured: true
          },
          {
            id: 2,
            title: "UX Designer",
            company_name: "Creative Solutions",
            company_logo: "https://placehold.co/60",
            location: "Remote",
            job_type: "Full-time",
            category: "Design",
            min_salary: 12000000,
            max_salary: 18000000,
            posted_date: "2023-05-19", // 1 week ago
            description: "Design user experiences for web and mobile applications. Create wireframes, prototypes, and collaborate with developers to implement designs. Must have experience with Figma and user research methodologies.",
            skills: ["Figma", "User Research", "Prototyping"],
            is_featured: false
          },
          {
            id: 3,
            title: "Data Analyst",
            company_name: "TechGrowth",
            company_logo: "https://placehold.co/60",
            location: "Bandung, Indonesia",
            job_type: "Contract",
            category: "Data Science",
            min_salary: 8000000,
            max_salary: 12000000,
            posted_date: "2023-05-23", // 3 days ago
            description: "Analyze large datasets to identify trends and insights. Create reports and dashboards to visualize data. Must be proficient in SQL, Excel, and data visualization tools.",
            skills: ["SQL", "Excel", "Data Visualization"],
            is_featured: false
          },
          {
            id: 4,
            title: "Backend Engineer",
            company_name: "Startup Hub",
            company_logo: "https://placehold.co/60",
            location: "Yogyakarta, Indonesia",
            job_type: "Full-time",
            category: "IT & Software",
            min_salary: 15000000,
            max_salary: 25000000,
            posted_date: "2023-05-26", // just now
            description: "Develop and maintain server-side logic and APIs. Work with databases and cloud infrastructure. Must have experience with Node.js, MongoDB, and Express.",
            skills: ["Node.js", "MongoDB", "Express"],
            is_featured: true
          }
        ]);
        
        setJobTypes([
          { id: 1, name: "Full-time" },
          { id: 2, name: "Part-time" },
          { id: 3, name: "Contract" },
          { id: 4, name: "Internship" },
          { id: 5, name: "Freelance" }
        ]);
        
        setJobCategories([
          { id: 1, name: "IT & Software" },
          { id: 2, name: "Design" },
          { id: 3, name: "Marketing" },
          { id: 4, name: "Data Science" },
          { id: 5, name: "Business" }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        setError("Failed to load job data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Load bookmarked jobs from localStorage
    const savedBookmarks = localStorage.getItem('bookmarkedJobs');
    if (savedBookmarks) {
      setBookmarkedJobs(JSON.parse(savedBookmarks));
    }
  }, []);
  
  // Save bookmarks to localStorage when changed
  useEffect(() => {
    localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs));
  }, [bookmarkedJobs]);
  
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
    setTempSalaryRange(newValue as number[]);
  };

  // Format posted date to relative time
  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Count active filters
  const activeFilterCount = 
    (selectedJobType !== "All" ? 1 : 0) + 
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedLocation !== "All" ? 1 : 0) + 
    (salaryRange[0] > 5000000 || salaryRange[1] < 30000000 ? 1 : 0);

  // Filter jobs based on all criteria
  const filteredJobs = jobPosts.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesJobType = selectedJobType === "All" || job.job_type === selectedJobType;
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
    const matchesLocation = selectedLocation === "All" || job.location.includes(selectedLocation);
    
    const matchesSalary = 
      job.min_salary >= salaryRange[0] && job.max_salary <= salaryRange[1];
    
    return matchesSearch && matchesJobType && matchesCategory && matchesLocation && matchesSalary;
  });

  // Sort jobs based on selected criteria
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
    } else if (sort === "oldest") {
      return new Date(a.posted_date).getTime() - new Date(b.posted_date).getTime();
    } else if (sort === "salaryAsc") {
      return a.min_salary - b.min_salary;
    } else if (sort === "salaryDesc") {
      return b.min_salary - a.min_salary;
    }
    return 0;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedJobType("All");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSalaryRange([5000000, 30000000]);
    setSort("newest");
    
    // Also reset temporary filters
    setTempJobType("All");
    setTempCategory("All");
    setTempLocation("All");
    setTempSalaryRange([5000000, 30000000]);
  };

  // Render filter content - used in both dialog and drawer
  const renderFilterContent = () => (
    <>
      {/* Job Type Filter */}
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>Job Type</InputLabel>
        <Select 
          value={tempJobType}
          onChange={(e) => setTempJobType(e.target.value as string)}
          label="Job Type"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="All">All Types</MenuItem>
          {jobTypes.map(type => (
            <MenuItem key={type.id} value={type.name}>{type.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Category Filter */}
      <FormControl fullWidth variant="outlined" margin="normal" sx={{ mt: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select 
          value={tempCategory}
          onChange={(e) => setTempCategory(e.target.value as string)}
          label="Category"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {jobCategories.map(category => (
            <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Location Filter */}
      <FormControl fullWidth variant="outlined" margin="normal" sx={{ mt: 2 }}>
        <InputLabel>Location</InputLabel>
        <Select 
          value={tempLocation}
          onChange={(e) => setTempLocation(e.target.value as string)}
          label="Location"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="All">All Locations</MenuItem>
          <MenuItem value="Jakarta">Jakarta</MenuItem>
          <MenuItem value="Bandung">Bandung</MenuItem>
          <MenuItem value="Remote">Remote</MenuItem>
          <MenuItem value="Yogyakarta">Yogyakarta</MenuItem>
        </Select>
      </FormControl>
      
      {/* Salary Range Filter */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          Salary Range
        </Typography>
        <Box sx={{ px: 1, pt: 2 }}>
          <Slider
            value={tempSalaryRange}
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
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {formatSalary(tempSalaryRange[0])}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {formatSalary(tempSalaryRange[1])}
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Page Header */}
      <Box 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          position: 'relative',
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(3, 169, 244, 0.9) 0%, rgba(0, 188, 212, 0.9) 100%)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
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
            background: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174) center/cover',
            borderRadius: 3,
          }}
        />
        
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2, position: 'relative' }}>
          Find your dream job
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 3, position: 'relative', maxWidth: '700px', mx: 'auto' }}>
          Discover {jobPosts.length} opportunities that match your skills and interests
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex',
            maxWidth: '650px',
            mx: 'auto',
            backgroundColor: 'white',
            borderRadius: 3,
            p: 0.8,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
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
              sx: { px: 1.5, py: 1 }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // Handle search
              }
            }}
          />
          <Button 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Filter and Sort Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-start', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<TuneIcon />}
          onClick={openFilterDialog}
          size="medium"
          sx={{ 
            borderRadius: 2,
            px: 2,
            fontWeight: 500,
            '&:hover': { backgroundColor: 'rgba(3, 169, 244, 0.08)' }
          }}
        >
          {activeFilterCount > 0 ? (
            <Badge badgeContent={activeFilterCount} color="error" sx={{ mr: 0.5 }}>
              Filters
            </Badge>
          ) : (
            "Filters"
          )}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<SortIcon />}
          onClick={toggleSortDialog}
          size="medium"
          sx={{ 
            borderRadius: 2,
            px: 2,
            fontWeight: 500,
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          {sort === "newest" && "Newest first"}
          {sort === "oldest" && "Oldest first"}
          {sort === "salaryAsc" && "Salary: low to high"}
          {sort === "salaryDesc" && "Salary: high to low"}
        </Button>

        {/* Active filter chips */}
        {selectedJobType !== "All" && (
          <Chip 
            label={`Job Type: ${selectedJobType}`}
            onDelete={() => setSelectedJobType("All")}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{ borderRadius: 2 }}
          />
        )}
        
        {selectedCategory !== "All" && (
          <Chip 
            label={`Category: ${selectedCategory}`}
            onDelete={() => setSelectedCategory("All")}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{ borderRadius: 2 }}
          />
        )}
        
        {selectedLocation !== "All" && (
          <Chip 
            label={`Location: ${selectedLocation}`}
            onDelete={() => setSelectedLocation("All")}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{ borderRadius: 2 }}
          />
        )}
        
        {(salaryRange[0] > 5000000 || salaryRange[1] < 30000000) && (
          <Chip 
            label={`Salary: ${formatSalary(salaryRange[0])} - ${formatSalary(salaryRange[1])}`}
            onDelete={() => setSalaryRange([5000000, 30000000])}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{ borderRadius: 2 }}
          />
        )}

        {activeFilterCount > 0 && (
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={resetFilters}
            sx={{ ml: 'auto', fontWeight: 500 }}
          >
            Clear all filters
          </Button>
        )}
      </Box>

      {/* Results Counter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          {sortedJobs.length} jobs found
        </Typography>
      </Box>
      
      {/* Job Listings */}
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column', 
          py: 10,
        }}>
          <CircularProgress size={50} />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Finding the best opportunities...
          </Typography>
        </Box>
      ) : sortedJobs.length > 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={3}>
              {sortedJobs.map((job, index) => (
                <Grow in={true} timeout={(index + 1) * 200} key={job.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
                      },
                      border: job.is_featured 
                        ? `2px solid ${theme.palette.primary.main}`
                        : '1px solid rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    {job.is_featured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 31,
                          right: 50,
                          fontWeight: 'bold',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                          py: 0.5,
                          px: 0.5
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ pt: 3, pb: 2 }}>
                      <Box sx={{ display: 'flex' }}>
                        <Avatar 
                          src={job.company_logo || "https://placehold.co/60"} 
                          alt={job.company_name}
                          variant="rounded"
                          sx={{ 
                            width: 64, 
                            height: 64,
                            mr: 2.5,
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                            borderRadius: 2
                          }} 
                        />
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'self-end' }}>
                            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 0.5 }}>
                              {job.title}
                            </Typography>
                            
                            <Tooltip title={bookmarkedJobs.includes(job.id) ? "Remove from saved jobs" : "Save job"}>
                              <IconButton 
                                size="medium"
                                onClick={(e) => toggleBookmark(job.id, e)}
                                sx={{
                                  backgroundColor: bookmarkedJobs.includes(job.id) 
                                    ? 'rgba(3, 169, 244, 0.15)' 
                                    : 'transparent',
                                  '&:hover': {
                                    backgroundColor: bookmarkedJobs.includes(job.id) 
                                      ? 'rgba(3, 169, 244, 0.25)' 
                                      : 'rgba(0, 0, 0, 0.05)'
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
                            {job.company_name}
                          </Typography>
                          
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            sx={{ mt: 1, flexWrap: 'wrap', gap: 1, '& > *': { mb: 0.5 } }}
                          >
                            <Chip 
                              label={job.location} 
                              size="small" 
                              icon={<LocationIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '8px' }}
                            />
                            
                            <Chip 
                              label={job.job_type} 
                              size="small" 
                              icon={<WorkIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '8px' }}
                            />
                            
                            <Chip 
                              label={job.category} 
                              size="small" 
                              icon={<CategoryIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '8px' }}
                            />
                            
                            <Chip 
                              label={formatPostedDate(job.posted_date)} 
                              size="small" 
                              icon={<ClockIcon fontSize="small" />}
                              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', borderRadius: '8px' }}
                            />
                            
                            <Chip 
                              label={`Rp ${(job.min_salary/1000000).toFixed(1)}M - ${(job.max_salary/1000000).toFixed(1)}M`} 
                              size="small" 
                              icon={<MoneyIcon fontSize="small" />}
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: '8px' }}
                            />
                          </Stack>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {job.description.length > 180 && expandedJobId !== job.id
                          ? `${job.description.substring(0, 180)}...` 
                          : job.description}
                      </Typography>
                      
                      {expandedJobId === job.id && (
                        <Fade in={expandedJobId === job.id}>
                          <Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Required Skills:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                {job.skills.map(skill => (
                                  <Chip 
                                    key={skill} 
                                    label={skill} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: 'rgba(3, 169, 244, 0.1)',
                                      color: '#0277BD',
                                      fontWeight: 500,
                                      borderRadius: 2
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Fade>
                      )}

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mt: 2,
                        pt: 1
                      }}>
                        <Button 
                          variant="text" 
                          size="small"
                          onClick={() => toggleJobExpand(job.id)}
                          endIcon={expandedJobId === job.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                          {expandedJobId === job.id ? 'Show less' : 'Show more'}
                        </Button>
                        
                        <Box>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ 
                              mr: 1.5, 
                              borderRadius: '8px',
                              px: 2
                            }}
                          >
                            Details
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small"
                            sx={{
                              boxShadow: 'none',
                              borderRadius: '8px',
                              px: 2,
                              fontWeight: 600,
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(3, 169, 244, 0.3)'
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
          </Grid>
        </Grid>
      ) : (
        // No results found - Enhanced empty state
        <Paper 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <SearchOffIcon sx={{ fontSize: 70, color: 'rgba(0, 0, 0, 0.2)', mb: 3 }} />
          <Typography variant="h5" gutterBottom fontWeight="600">
            No jobs match your search criteria
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Try adjusting your filters or search term to see more results
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={resetFilters}
            size="large"
            sx={{ 
              py: 1.2,
              px: 4,
              borderRadius: 2,
              fontWeight: 600
            }}
          >
            Reset All Filters
          </Button>
          
          {/* Show what filters are currently applied */}
          {(selectedJobType !== "All" || selectedCategory !== "All" || selectedLocation !== "All" || 
            searchTerm || salaryRange[0] > 5000000 || salaryRange[1] < 30000000) && (
            <Box sx={{ mt: 5, p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 3, width: '100%', maxWidth: 600, mx: 'auto' }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Current filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ '& > *': { mb: 1, mx: 0.5 } }}>
                {searchTerm && (
                  <Chip label={`Search: "${searchTerm}"`} size="small" onDelete={() => setSearchTerm("")} />
                )}
                {selectedJobType !== "All" && (
                  <Chip label={`Job Type: ${selectedJobType}`} size="small" onDelete={() => setSelectedJobType("All")} />
                )}
                {selectedCategory !== "All" && (
                  <Chip label={`Category: ${selectedCategory}`} size="small" onDelete={() => setSelectedCategory("All")} />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Button 
            variant="outlined" 
            color="primary"
            sx={{ 
              px: 5,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: 'rgba(3, 169, 244, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(3, 169, 244, 0.15)'
              }
            }}
          >
            Load more jobs
          </Button>
        </Box>
      )}

      {/* Filter Dialog - Enhanced with sort options and responsive design */}
      <Dialog
        open={filterDialogOpen}
        onClose={closeFilterDialog}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" fontWeight="600">
            Filter & Sort
          </Typography>
          
          <IconButton onClick={closeFilterDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {/* Filter content - reused from main component */}
          {renderFilterContent()}
          
          {/* Sort Options - Moved here from the main component for better UX */}
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Sort by
          </Typography>
          
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Sort by</InputLabel>
            <Select 
              value={sort}
              onChange={(e) => setSort(e.target.value as string)}
              label="Sort by"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="newest">Newest first</MenuItem>
              <MenuItem value="oldest">Oldest first</MenuItem>
              <MenuItem value="salaryAsc">Salary: low to high</MenuItem>
              <MenuItem value="salaryDesc">Salary: high to low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ pt: 0, pb: 2, justifyContent: 'space-between' }}>
          <Button 
            variant="text" 
            color="error"
            onClick={resetFilters}
            sx={{ fontWeight: 500 }}
          >
            Reset Filters
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={applyFilters}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sort Dialog - For mobile users, triggered from the sort button */}
      <Dialog
        open={sortDialogOpen}
        onClose={toggleSortDialog}
        fullWidth
        maxWidth="xs"
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" fontWeight="600">
            Sort Options
          </Typography>
          
          <IconButton onClick={toggleSortDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Sort by</InputLabel>
            <Select 
              value={sort}
              onChange={(e) => setSort(e.target.value as string)}
              label="Sort by"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="newest">Newest first</MenuItem>
              <MenuItem value="oldest">Oldest first</MenuItem>
              <MenuItem value="salaryAsc">Salary: low to high</MenuItem>
              <MenuItem value="salaryDesc">Salary: high to low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ pt: 0, pb: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={toggleSortDialog}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Apply Sort
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mobile action button for filters */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
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
              p: 2.5,
              boxShadow: '0 6px 16px rgba(3, 169, 244, 0.5)'
            }}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Badge 
              badgeContent={
                (selectedJobType !== "All" ? 1 : 0) + 
                (selectedCategory !== "All" ? 1 : 0) +
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
    </Container>
  );
};

export default Job;