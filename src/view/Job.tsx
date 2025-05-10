import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Container,
  Grid,
  Paper,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Avatar
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
    <div className="jobs-page">
      <div className="jobs-header">
        <h1>Find your dream job</h1>
        <p>Discover opportunities that match your skills and interests</p>
      </div>
      
      <div className="jobs-container">
        {/* Left sidebar with filters */}
        <div className="jobs-filters">
          <div className="search-bar">
            <SearchIcon className="search-icon" />
            <TextField
              variant="outlined"
              placeholder="Search by title, skill, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </div>
          
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Job Type</InputLabel>
            <Select 
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              label="Job Type"
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
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Location"
            >
              <MenuItem value="All">All Locations</MenuItem>
              <MenuItem value="Jakarta">Jakarta</MenuItem>
              <MenuItem value="Bandung">Bandung</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="Yogyakarta">Yogyakarta</MenuItem>
            </Select>
          </FormControl>
          
          <div className="salary-range">
            <Typography variant="subtitle1">Salary Range</Typography>
            <div className="salary-inputs">
              <TextField 
                variant="outlined" 
                placeholder="Min" 
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
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
                fullWidth
              />
            </div>
          </div>
          
          <Button 
            variant="contained" 
            color="primary" 
            className="filter-reset"
            onClick={() => {
              setSearchTerm("");
              setSelectedJobType("All");
              setSelectedLocation("All");
              setMinSalary("");
              setMaxSalary("");
              setSort("newest");
            }}
            fullWidth
          >
            Reset Filters
          </Button>
        </div>
        
        {/* Right side with job listings */}
        <div className="job-listings">
          <div className="listings-header">
            <Typography variant="h6">{sortedJobs.length} job results</Typography>
            <div className="sort-by">
              <Typography variant="body2">Sort by:</Typography>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                variant="outlined"
                size="small"
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="salaryAsc">Salary: low to high</MenuItem>
                <MenuItem value="salaryDesc">Salary: high to low</MenuItem>
              </Select>
            </div>
          </div>
          
          {sortedJobs.length > 0 ? (
            <div className="job-cards">
              {sortedJobs.map(job => (
                <Card className="job-card" key={job.id}>
                  <CardContent>
                    <div className="job-card-header">
                      <Avatar src={job.logo} alt={job.company} className="company-logo" />
                      <div className="job-info">
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography variant="subtitle1" color="textSecondary">{job.company}</Typography>
                        <div className="job-details">
                          <Chip label={job.location} icon={<LocationIcon />} size="small" />
                          <Chip label={job.type} icon={<WorkIcon />} size="small" />
                          <Chip label={job.postedDate} icon={<ClockIcon />} size="small" />
                        </div>
                      </div>
                      <Button className="save-job" size="small">
                        <BookmarkIcon />
                      </Button>
                    </div>
                    
                    <Divider />
                    
                    <div className="job-card-body">
                      <Typography className="job-salary" variant="body1">{job.salary}</Typography>
                      <Typography className="job-description" variant="body2" color="textSecondary">{job.description}</Typography>
                    </div>
                  </CardContent>
                  
                  <CardActions>
                    <Button className="apply-btn" size="small" variant="contained" color="primary">Apply Now</Button>
                    <Button className="details-btn" size="small" variant="outlined" color="primary">View Details</Button>
                  </CardActions>
                </Card>
              ))}
            </div>
          ) : (
            <div className="no-jobs">
              <Typography variant="h6">No jobs match your search criteria</Typography>
              <Typography variant="body2" color="textSecondary">Try adjusting your filters or search term</Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Job;