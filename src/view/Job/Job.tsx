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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Container,
  Snackbar
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
import { FetchEndpoint } from '../FetchEndpoint'; // Import the FetchEndpoint utility
import { NotNull } from 'sequelize-typescript';

// Align interfaces with backend models
interface JobPost {
  job_id: string;
  title: string;
  description: string;
  category_id: number;
  type_id: number;
  posted_date: string;
  company_name: string;  
  company_logo?: string; 
  location: string;      
  min_salary: number;    
  max_salary: number;    
  is_featured: boolean;  
  skills: Skill[];       
  job_type: string;      
  category: string;      
}

interface JobType {
  type_id: number;
  type_name: string;
}

interface JobCategory {
  category_id: number;
  category_name: string;
}

interface Skill {
  skill_id: number;
  skill_name: string;
}

interface JobApplication {
  id: number;
  job_id: string;
  applier_id: string;
  status: 'applied' | 'interviewing' | 'hired' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const Job: React.FC = () => {
  const theme = useTheme();
  
  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sort, setSort] = useState("newest");
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  
  // Filter dialog/drawer state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Temporary filter states (for applying only when user clicks "Apply")
  const [tempJobType, setTempJobType] = useState("All");
  const [tempCategory, setTempCategory] = useState("All");
  const [tempLocation, setTempLocation] = useState("All");
  const [tempSalaryRange, setTempSalaryRange] = useState<number[]>([5000000, 30000000]);
  
  // Salary slider settings
  const [salaryRange, setSalaryRange] = useState<number[]>([0, 50000000]);
  const formatSalary = (value: number) => `Rp ${(value/1000000).toFixed(1)}M`;

  // Show snackbar notification
  const showNotification = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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

  // Handle applying to job
  const openApplyDialog = (jobId: string) => {
    setSelectedJobId(jobId);
    setApplyDialogOpen(true);
  };

  // Handle apply job submission - Using FetchEndpoint instead of axios
  const handleApplyJob = async () => {
    if (!selectedJobId) return;

    try {
      setIsLoading(true);
      
      // Get token from localStorage (similar to LoginModal)
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error("You need to login first to apply for this job");
      }
      
      // Use FetchEndpoint utility instead of axios
      const response = await FetchEndpoint('/job/apply', 'POST', token, { job_id: selectedJobId });
      
      // Process the response
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(
          data.data?.message || 
          data.message || 
          'Failed to apply for job. Please try again.'
        );
      }

      // Add to applied jobs
      setAppliedJobs(prev => [...prev, selectedJobId]);
      setApplyDialogOpen(false);
      
      // Show success notification
      showNotification("Successfully applied for the job!", "success");
    } catch (error: any) {
      console.error('Error applying for job:', error);
      
      // Show error notification
      showNotification(error.message || "Failed to apply for job. Please try again.", "error");
      setError(error.message || "Failed to apply for job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load job data - Using FetchEndpoint instead of axios
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');
        
        // Fetch job posts
        const jobsResponse = await FetchEndpoint('/job', 'GET', token, null);
        const jobsData = await jobsResponse.json();
        
        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.data?.message || 
            jobsData.message || 
            'Failed to fetch jobs data'
          );
        }
        
        // Fetch job types
        const typesResponse = await FetchEndpoint('/job-types', 'GET', token, null);
        const typesData = await typesResponse.json();
        
        if (!typesResponse.ok) {
          throw new Error(
            typesData.data?.message || 
            typesData.message || 
            'Failed to fetch job types'
          );
        }
        
        // Fetch job categories
        const categoriesResponse = await FetchEndpoint('/job-categories', 'GET', token, null);
        const categoriesData = await categoriesResponse.json();
        
        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.data?.message || 
            categoriesData.message || 
            'Failed to fetch job categories'
          );
        }
        
        // Fetch user's applied jobs (only if logged in)
        let appliedJobIds: string[] = [];
        if (token) {
          try {
            const applicationsResponse = await FetchEndpoint('/job/my-applications', 'GET', token, null);
            const applicationsData = await applicationsResponse.json();
            
            if (applicationsResponse.ok) {
              // Extract job IDs from applications
              appliedJobIds = applicationsData.data.map((app: JobApplication) => app.job_id);
            }
          } catch (err) {
            console.error("Error fetching applied jobs:", err);
            // Non-critical error, continue without applied jobs data
          }
        }
        
        // Process job data to match our interface
        const jobData = jobsData.data || [];
        const typeData = typesData.data || [];
        const categoryData = categoriesData.data || [];
        
        // Map job data from response to our JobPost interface
        const processedJobs: JobPost[] = jobData.map((job: any) => {
          // Look up the job type and category names from their IDs
          const jobType = typeData.find((type: JobType) => type.type_id === job.type_id);
          const jobCategory = categoryData.find((cat: JobCategory) => cat.category_id === job.category_id);
          
          // Map database fields to frontend model
          return {
            job_id: job.job_id,
            title: job.title,
            description: job.description || "",
            category_id: job.category_id,
            type_id: job.type_id,
            posted_date: job.posted_date,
            company_name: job.company_name || "Company", // Use actual company data if available
            company_logo: job.company_logo || "https://placehold.co/60",
            location: job.location || "Location not specified",
            min_salary: job.min_salary || 5000000,
            max_salary: job.max_salary || 30000000,
            is_featured: job.is_featured || false,
            skills: job.skills || [],
            job_type: jobType ? jobType.type_name : "Unknown",
            category: jobCategory ? jobCategory.category_name : "Unknown"
          };
        });

        // Update state with fetched data
        setJobPosts(processedJobs);
        setJobTypes(typeData);
        setJobCategories(categoryData);
        setAppliedJobs(appliedJobIds);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching job data:", error);
        setError(error.message || "Failed to load job data. Please try again later.");
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
      job.skills.some(skill => skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
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
    setSelectedCategory("All");
    setSalaryRange([0, 50000000]);
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
            <MenuItem key={type.type_id} value={type.type_name}>{type.type_name}</MenuItem>
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
            <MenuItem key={category.category_id} value={category.category_name}>{category.category_name}</MenuItem>
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

  // State for showing mobile filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle search submit
  const handleSearch = () => {
    // The filtering is already handled by the filteredJobs variable
    // This function is just a placeholder for any additional search logic
    console.log("Searching for:", searchTerm);
  };

  // Load more jobs (pagination)
  const loadMoreJobs = async () => {
    showNotification("Loading more jobs...", "success");
    
    try {
      const token = localStorage.getItem('accessToken');
      const currentPage = Math.ceil(jobPosts.length / 10); // Assuming 10 jobs per page
      
      const response = await FetchEndpoint(`/jobs?page=${currentPage + 1}`, 'GET', token);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load more jobs');
      }
      
      // Add new jobs to existing ones
      setJobPosts(prev => [...prev, ...data.data]);
      
    } catch (error: any) {
      showNotification("Failed to load more jobs: " + (error.message || "Unknown error"), "error");
    }
  };

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
                handleSearch();
              }
            }}
          />
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSearch}
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
                <Grow in={true} timeout={(index + 1) * 200} key={job.job_id}>
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
                            
                            <Tooltip title={bookmarkedJobs.includes(job.job_id) ? "Remove from saved jobs" : "Save job"}>
                              <IconButton 
                                size="medium"
                                onClick={(e) => toggleBookmark(job.job_id, e)}
                                sx={{
                                  backgroundColor: bookmarkedJobs.includes(job.job_id) 
                                    ? 'rgba(3, 169, 244, 0.15)' 
                                    : 'transparent',
                                  '&:hover': {
                                    backgroundColor: bookmarkedJobs.includes(job.job_id) 
                                      ? 'rgba(3, 169, 244, 0.25)' 
                                      : 'rgba(0, 0, 0, 0.05)'
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
                        {job.description.length > 180 && expandedJobId !== job.job_id
                          ? `${job.description.substring(0, 180)}...` 
                          : job.description}
                      </Typography>
                      
                      {expandedJobId === job.job_id && (
                        <Fade in={expandedJobId === job.job_id}>
                          <Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Required Skills:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                {job.skills.map(skill => (
                                  <Chip 
                                    key={skill.skill_id} 
                                    label={skill.skill_name} 
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
                          onClick={() => toggleJobExpand(job.job_id)}
                          endIcon={expandedJobId === job.job_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                          {expandedJobId === job.job_id ? 'Show less' : 'Show more'}
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
                            disabled={appliedJobs.includes(job.job_id)}
                            onClick={() => openApplyDialog(job.job_id)}
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
                            {appliedJobs.includes(job.job_id) ? 'Applied' : 'Apply Now'}
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
            onClick={loadMoreJobs}
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

      {/* Apply Job Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 3 } }}
      >
        <DialogTitle sx={{ 
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" fontWeight="600">
            Apply for this job
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Typography variant="body1">
            Are you sure you want to apply for this job? Your profile information will be shared with the employer.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ pt: 0, pb: 2, justifyContent: 'space-between' }}>
          <Button 
            variant="outlined"
            onClick={() => setApplyDialogOpen(false)}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleApplyJob}
            disabled={isLoading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Apply'
            )}
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
            onClick={openFilterDialog}
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

      {/* Success/Error notification */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Job;