import React, { useState } from 'react';
import './Job.css';
import { FaMapMarkerAlt, FaRegClock, FaBriefcase, FaBookmark, FaSearch, FaFilter } from 'react-icons/fa';

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

  // Filter jobs based on search term and filters
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobType = selectedJobType === "All" || job.type === selectedJobType;
    const matchesLocation = selectedLocation === "All" || job.location.includes(selectedLocation);
    
    return matchesSearch && matchesJobType && matchesLocation;
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
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, skill, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-section">
            <h3>Job Type</h3>
            <select 
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Location</h3>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Remote">Remote</option>
              <option value="Yogyakarta">Yogyakarta</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>Salary Range</h3>
            <div className="salary-inputs">
              <input type="text" placeholder="Min" />
              <span>to</span>
              <input type="text" placeholder="Max" />
            </div>
          </div>
          
          <button className="filter-reset">Reset Filters</button>
        </div>
        
        {/* Right side with job listings */}
        <div className="job-listings">
          <div className="listings-header">
            <h3>{filteredJobs.length} job results</h3>
            <div className="sort-by">
              <span>Sort by:</span>
              <select>
                <option>Newest first</option>
                <option>Relevance</option>
                <option>Salary: high to low</option>
                <option>Salary: low to high</option>
              </select>
            </div>
          </div>
          
          {filteredJobs.length > 0 ? (
            <div className="job-cards">
              {filteredJobs.map(job => (
                <div className="job-card" key={job.id}>
                  <div className="job-card-header">
                    <img src={job.logo} alt={job.company} className="company-logo" />
                    <div className="job-info">
                      <h2>{job.title}</h2>
                      <h3>{job.company}</h3>
                      <div className="job-details">
                        <span><FaMapMarkerAlt /> {job.location}</span>
                        <span><FaBriefcase /> {job.type}</span>
                        <span><FaRegClock /> {job.postedDate}</span>
                      </div>
                    </div>
                    <button className="save-job">
                      <FaBookmark />
                    </button>
                  </div>
                  
                  <div className="job-card-body">
                    <p className="job-salary">{job.salary}</p>
                    <p className="job-description">{job.description}</p>
                  </div>
                  
                  <div className="job-card-footer">
                    <button className="apply-btn">Apply Now</button>
                    <button className="details-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-jobs">
              <h3>No jobs match your search criteria</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Job;