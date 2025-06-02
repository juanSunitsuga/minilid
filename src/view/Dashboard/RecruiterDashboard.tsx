import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PeopleAlt as ApplicantsIcon,
  Business as CompanyIcon,
  WorkOutline as JobIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

interface JobPost {
  job_id: string;
  title: string;
  description: string;
  posted_date: string;
  category?: {
    category_id: string;
    name: string;
  };
  type?: {
    type_id: string;
    name: string;
  };
  company?: {
    company_id: string | null;
    name: string;
    address: string;
  };
  applicants_count: number;
}

const RecruiterDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching job postings with token:', token);
      const response = await FetchEndpoint('/job-applications/job-applicants', 'GET', token, null);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }
      
      const data = await response.json();
      setJobs(data.data || []);
    } catch (err: any) {
      console.error('Error fetching job postings:', err);
      setError(err.message || 'An error occurred while fetching your job postings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await FetchEndpoint(`/jobs/${jobId}`, 'DELETE', token, null);
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      // Refresh the list
      fetchJobs();
    } catch (err: any) {
      console.error('Error deleting job:', err);
      alert(err.message || 'An error occurred while deleting the job posting');
    }
  };

  // Calculate statistics
  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce((acc, job) => acc + job.applicants_count, 0);
  const avgApplicantsPerJob = totalJobs > 0 ? Math.round(totalApplicants / totalJobs * 10) / 10 : 0;
  
  // Find job with most applicants
  const mostAppliedJob = jobs.reduce((prev, current) => 
    (prev.applicants_count > current.applicants_count) ? prev : current, 
    { job_id: '', title: 'None', applicants_count: 0 } as JobPost
  );

  // Prepare chart data
  const jobsWithApplicants = jobs.filter(job => job.applicants_count > 0).slice(0, 5);
  const chartData = {
    labels: jobsWithApplicants.map(job => truncate(job.title, 20)),
    datasets: [
      {
        data: jobsWithApplicants.map(job => job.applicants_count),
        backgroundColor: [
          '#3f51b5', '#f50057', '#00acc1', '#ff9800', '#4caf50',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Helper function to truncate text
  function truncate(str: string, n: number) {
    return (str.length > n) ? str.slice(0, n-1) + '…' : str;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recruiter Dashboard
        </Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchJobs}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            to="/create-job"
          >
            Post New Job
          </Button>
        </Box>
      </Box>

      {/* Stats Cards - Using Box with flexbox instead of Grid */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4 
        }}
      >
        {/* Active Job Postings */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', sm: '45%', md: '22%' }, 
          minWidth: { xs: '100%', sm: '220px', md: '200px' } 
        }}>
          <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <JobIcon sx={{ fontSize: 40, color: 'primary.contrastText', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="primary.contrastText">
                {totalJobs}
              </Typography>
              <Typography variant="body2" color="primary.contrastText">
                Active Job Postings
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Total Applicants */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', sm: '45%', md: '22%' }, 
          minWidth: { xs: '100%', sm: '220px', md: '200px' } 
        }}>
          <Card sx={{ height: '100%', bgcolor: 'info.light' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ApplicantsIcon sx={{ fontSize: 40, color: 'info.contrastText', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="info.contrastText">
                {totalApplicants}
              </Typography>
              <Typography variant="body2" color="info.contrastText">
                Total Applicants
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Average Applicants per Job */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', sm: '45%', md: '22%' }, 
          minWidth: { xs: '100%', sm: '220px', md: '200px' } 
        }}>
          <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="success.contrastText">
                {avgApplicantsPerJob}
              </Typography>
              <Typography variant="body2" color="success.contrastText">
                Average Applicants per Job
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Most Applied Job */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', sm: '45%', md: '22%' }, 
          minWidth: { xs: '100%', sm: '220px', md: '200px' } 
        }}>
          <Card sx={{ height: '100%', bgcolor: 'warning.light' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="warning.contrastText" sx={{ mb: 1 }}>
                {mostAppliedJob.title !== 'None' ? truncate(mostAppliedJob.title, 20) : 'None'}
              </Typography>
              <Typography variant="body2" color="warning.contrastText">
                Most Applied Job ({mostAppliedJob.applicants_count} applicants)
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts and Tables Row - Using Box with flexbox instead of Grid */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3 
        }}
      >
        {/* Chart */}
        <Box sx={{ 
          flexGrow: 1, 
          flexBasis: { xs: '100%', md: '30%' }, 
          minWidth: { xs: '100%', md: '300px' }
        }}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" gutterBottom align="center">
              Top 5 Jobs by Applicants
            </Typography>
            {jobsWithApplicants.length > 0 ? (
              <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut 
                  data={chartData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }} 
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No jobs with applicants yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Jobs Table */}
        <Box sx={{ 
          flexGrow: 2, 
          flexBasis: { xs: '100%', md: '65%' }
        }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Job Postings
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" align="center" sx={{ p: 3 }}>
                  {error}
                </Typography>
              ) : jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" gutterBottom>No jobs posted yet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start posting jobs to attract candidates
                  </Typography>
                  <Button
                    component={Link}
                    to="/jobs/create"
                    variant="contained"
                    sx={{ mt: 2 }}
                    startIcon={<AddIcon />}
                  >
                    Post a Job
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Job Title</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Posted Date</strong></TableCell>
                        <TableCell><strong>Applicants</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow 
                          key={job.job_id}
                          component={Link}
                          to={`/job/${job.job_id}`}
                          hover>
                          <TableCell>
                            <Typography variant="body1">{job.title}</Typography>
                          </TableCell>
                          <TableCell>
                            {job.type?.name || 'Uncategorized'}
                          </TableCell>
                          <TableCell>
                            {job.category?.name || 'Uncategorized'}
                          </TableCell>
                          <TableCell>
                            {new Date(job.posted_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              badgeContent={job.applicants_count} 
                              color={job.applicants_count > 0 ? "primary" : "default"}
                              showZero
                            >
                              <ApplicantsIcon />
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default RecruiterDashboard;