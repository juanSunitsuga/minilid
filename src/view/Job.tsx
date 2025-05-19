import React, { useState } from 'react';
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
  Chip,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AccessTime as ClockIcon,
  Bookmark as BookmarkIcon,
  FilterList as FilterIcon,
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
  },
];

const Job: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sort, setSort] = useState("newest");

  // Filter jobs based on search term and filters
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobType = selectedJobType === "All" || job.type === selectedJobType;
    const matchesLocation = selectedLocation === "All" || job.location.includes(selectedLocation);
    const matchesSalary = (minSalary === "" || job.salary.split(' - ')[0].replace(/[^0-9]/g, '') >= minSalary) &&
                          (maxSalary === "" || job.salary.split(' - ')[1].replace(/[^0-9]/g, '') <= maxSalary);
    
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

  return (
    <>
      {/* Page header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Find your dream job
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover opportunities that match your skills and interests
        </Typography>
      </Box>
      
      {/* Main content layout - two columns */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3
      }}>
        {/* Left sidebar with filters */}
        <Box sx={{ 
          width: { xs: '100%', md: '280px' },
          flexShrink: 0,
        }}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 2, 
              position: { xs: 'static', md: 'sticky' },
              top: '100px',
              borderRadius: 2
            }}
          >
            {/* Search field */}
            <TextField
              fullWidth
              placeholder="Search by title, skill, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              variant="outlined"
            />
            
            {/* Job Type filter */}
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Job Type</InputLabel>
              <Select 
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value as string)}
                label="Job Type"
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
              </Select>
            </FormControl>
            
            {/* Location filter */}
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
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
              </Select>
            </FormControl>
            
            {/* Salary Range filter */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Salary Range
              </Typography>
              <Stack spacing={1}>
                <TextField 
                  variant="outlined" 
                  placeholder="Min" 
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                  size="small"
                  fullWidth
                />
                <TextField 
                  variant="outlined" 
                  placeholder="Max" 
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                  size="small"
                  fullWidth
                />
              </Stack>
            </Box>
            
            {/* Reset button */}
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => {
                setSearchTerm("");
                setSelectedJobType("All");
                setSelectedLocation("All");
                setMinSalary("");
                setMaxSalary("");
                setSort("newest");
              }}
              fullWidth
              startIcon={<FilterIcon />}
            >
              Reset Filters
            </Button>
          </Paper>
        </Box>
        
        {/* Right side with job listings */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Results header */}
          <Paper 
            elevation={1}
            sx={{ 
              p: 2, 
              mb: 2,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6">
              {sortedJobs.length} job results
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Sort by:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as string)}
                  variant="outlined"
                >
                  <MenuItem value="newest">Newest first</MenuItem>
                  <MenuItem value="oldest">Oldest first</MenuItem>
                  <MenuItem value="salaryAsc">Salary: low to high</MenuItem>
                  <MenuItem value="salaryDesc">Salary: high to low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
          
          {/* Job Cards */}
          {sortedJobs.length > 0 ? (
            <Stack spacing={2}>
              {sortedJobs.map(job => (
                <Card key={job.id} sx={{ borderRadius: 2, boxShadow: 1 }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar 
                          src={job.logo} 
                          alt={job.company} 
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ mb: 0.5 }}>{job.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {job.company}
                          </Typography>
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            sx={{ 
                              flexWrap: 'wrap',
                              '& .MuiChip-root': { mb: 0.5 }
                            }}
                          >
                            <Chip 
                              icon={<LocationIcon fontSize="small" />} 
                              label={job.location}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              icon={<WorkIcon fontSize="small" />} 
                              label={job.type}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              icon={<ClockIcon fontSize="small" />} 
                              label={job.postedDate}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      </Box>
                      
                      <Button
                        size="small"
                        sx={{ minWidth: 40, height: 40 }}
                      >
                        <BookmarkIcon />
                      </Button>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      {job.salary}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.description}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button variant="contained" color="primary" sx={{ mr: 1 }}>
                      Apply Now
                    </Button>
                    <Button variant="outlined">
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Stack>
          ) : (
            <Paper
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                No jobs match your search criteria
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or search term
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Job;