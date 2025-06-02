import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  ClickAwayListener,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Schedule as ReviewIcon,
  Assignment as ApplicationIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Timer as TimerIcon,
  AttachMoney as SalaryIcon,
  Category as CategoryIcon,
  CloudUpload as UploadIcon,
  Description as DescriptionIcon,
  Build as SkillsIcon,
  ArrowBack as BackIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CheckCircle as CheckIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';
import { useAuth } from '../Context/AuthContext';

// Interface untuk job details
interface JobDetails {
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
    category: string;
  };
  type: {
    type_id: number;
    type: string;
  };
  skills: {
    skill_id: number;
    name: string;
  }[];
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  posted_date: string;
}

interface JobApplication {
  id: string;
  applier: {
    applier_id: string;
    name: string;
    email: string;
  };
  status: 'applied' | 'interviewing' | 'rejected';
  cover_letter?: string;
  createdAt: string;
  cv_available: boolean;
}

interface Category {
  category_id: number;
  category: string;
}

interface JobType {
  type_id: number;
  type: string;
}

interface Skill {
  skill_id: number;
  name: string;
}

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const { userData, userType, isAuthenticated } = useAuth();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    salary_min: '',
    salary_max: '',
    salary_type: 'monthly',
    category_id: '',
    type_id: ''
  });

  const downloadCV = async (applicationId: string, applierName: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Downloading CV for application:', applicationId);

      const response = await FetchEndpoint(`/job-applications/download-cv/${applicationId}`, 'GET', token, null);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed:', response.status, errorText);
        throw new Error(`Failed to download CV: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('CV blob size:', blob.size);

      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${applierName.replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('CV downloaded successfully');
    } catch (err) {
      console.error('Error downloading CV:', err);
      alert(`Failed to download CV: ${err.message}`);
    }
  };

  // ✅ NEW: Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <ApplicationIcon fontSize="small" />;
      case 'interviewing': return <ReviewIcon fontSize="small" />;
      case 'rejected': return <RejectIcon fontSize="small" />;
      default: return <ApplicationIcon fontSize="small" />;
    }
  };

  const validateSalary = useCallback(() => {
    const min = parseInt(editData.salary_min);
    const max = parseInt(editData.salary_max);

    if (!editData.salary_min && !editData.salary_max) {
      return { isValid: true, message: '' };
    }

    if (!editData.salary_min || !editData.salary_max) {
      return { isValid: true, message: '' };
    }

    if (min >= max) {
      return {
        isValid: false,
        message: 'Minimum salary must be less than maximum salary'
      };
    }

    return { isValid: true, message: '' };
  }, [editData.salary_min, editData.salary_max]);

  useEffect(() => {
    if (skillSearchTerm.trim() === '') {
      setFilteredSkills([]);
      setShowSuggestions(false); 
      return;
    }

    const filtered = availableSkills.filter(skill =>
      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
      !selectedSkills.includes(skill.name)
    );

    setFilteredSkills(filtered);
    setShowSuggestions(filtered.length > 0 || skillSearchTerm.trim().length > 0);
  }, [skillSearchTerm, availableSkills, selectedSkills]);

  // ✅ NEW: Fetch applications for recruiter
  const fetchApplications = async () => {
    if (!job || !jobId) return;

    setLoadingApplications(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await FetchEndpoint(`/job-applications/job/${jobId}/applications`, 'GET', token, null);

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoadingApplications(false);
    }
  };

  // ✅ NEW: Update application status
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(applicationId);
    try {
      const token = localStorage.getItem('accessToken');

      console.log('Updating application status:', applicationId, 'to', newStatus);

      const response = await FetchEndpoint(`/job-applications/applications/${applicationId}/status`, 'PATCH', token, { status: newStatus });

      if (newStatus === 'interviewing') {
        const response = await FetchEndpoint(`/chat/create-chat`, 'POST', token, {job_application_id: applicationId})
        
        
        if (!response.ok) {
          throw new Error('Failed to update application status');
        }
        const chat = await response.json();
        console.log('Chat created:', chat);
        
        navigate(`/chat`);
      }

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      const updatedApplication = await response.json();
      // Refresh applications list
      await fetchApplications();

      // Update selected application if it's the one being updated
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({
          ...selectedApplication,
          status: newStatus as any
        });
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewApplications = () => {
    setApplicationsDialogOpen(true);
    fetchApplications();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ NEW: Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'info';
      case 'interviewing': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatSalary = (job: JobDetails): string | null => {
    const { salary_min, salary_max, salary_type } = job;

    if (!salary_min && !salary_max) {
      return null;
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

  const formatPostedDate = (dateString: string): string => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  };

  const fetchCategoriesAndTypes = async () => {
    try {
      const [categoriesRes, typesRes, skillsRes] = await Promise.all([
        FetchEndpoint('/job/job-categories', 'GET', null, null),
        FetchEndpoint('/job/job-types', 'GET', null, null),
        FetchEndpoint('/job/skills', 'GET', null, null)
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setJobTypes(typesData);
      }

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setAvailableSkills(skillsData);
      }
    } catch (err) {
      console.error('Error fetching categories and types:', err);
    }
  };

  const handleSkillSelect = useCallback((skillName: string) => {
    if (!selectedSkills.includes(skillName)) {
      setSelectedSkills(prev => [...prev, skillName]);
    }
    setSkillSearchTerm('');
    setShowSuggestions(false);
  }, [selectedSkills]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill !== skillToRemove));
  }, []);

  const handleAddNewSkill = useCallback(async (skillName?: string) => {
    const newSkillName = skillName || skillSearchTerm.trim();

    if (!newSkillName) return;

    const existingSkill = availableSkills.find(
      skill => skill.name.toLowerCase() === newSkillName.toLowerCase()
    );

    if (existingSkill) {
      if (!selectedSkills.includes(existingSkill.name)) {
        setSelectedSkills(prev => [...prev, existingSkill.name]);
      }
      setSkillSearchTerm('');
      setShowSuggestions(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      const response = await FetchEndpoint('/job/skills', 'POST', token, {
        name: newSkillName
      });

      if (response.ok) {
        const newSkill = await response.json();
        const formattedNewSkill = {
          skill_id: newSkill.id || newSkill.skill_id,
          name: newSkill.name
        };

        setAvailableSkills(prev => [...prev, formattedNewSkill]);
        setSelectedSkills(prev => [...prev, formattedNewSkill.name]);
        setSkillSearchTerm('');
        setShowSuggestions(false);
      } else {
        throw new Error('Failed to add new skill');
      }
    } catch (err) {
      console.error('Error adding new skill:', err);
      alert('Failed to add new skill. Please try again.');
    }
  }, [skillSearchTerm, availableSkills, selectedSkills]);

  const handleOpenEditDialog = () => {
    if (!job) return;

    setEditData({
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      salary_type: job.salary_type || 'monthly',
      category_id: job.category.category_id.toString(),
      type_id: job.type.type_id.toString()
    });

    setSelectedSkills(job.skills.map(skill => skill.name));

    setEditDialogOpen(true);

    if (categories.length === 0 || jobTypes.length === 0 || availableSkills.length === 0) {
      fetchCategoriesAndTypes();
    }
  };

  const handleEditSubmit = async () => {
    if (!job) return;

    const salaryValidation = validateSalary();
    if (!salaryValidation.isValid) {
      alert(salaryValidation.message);
      return;
    }

    if (selectedSkills.length === 0) {
      alert('Please select at least one skill');
      return;
    }

    setEditSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please login to edit job');
        return;
      }

      const updatePayload = {
        salary_min: editData.salary_min ? parseInt(editData.salary_min) : null,
        salary_max: editData.salary_max ? parseInt(editData.salary_max) : null,
        salary_type: editData.salary_type,
        category_id: parseInt(editData.category_id),
        type_id: parseInt(editData.type_id),
        skills: selectedSkills
      };

      const response = await FetchEndpoint(`/job/jobs/${jobId}`, 'PUT', token, updatePayload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update job');
      }

      const updatedJob = { ...job };
      updatedJob.salary_min = updatePayload.salary_min || undefined;
      updatedJob.salary_max = updatePayload.salary_max || undefined;
      updatedJob.salary_type = updatePayload.salary_type;

      const selectedCategory = categories.find(cat => cat.category_id === updatePayload.category_id);
      if (selectedCategory) {
        updatedJob.category = {
          category_id: selectedCategory.category_id,
          category: selectedCategory.category
        };
      }

      const selectedType = jobTypes.find(type => type.type_id === updatePayload.type_id);
      if (selectedType) {
        updatedJob.type = {
          type_id: selectedType.type_id,
          type: selectedType.type
        };
      }

      updatedJob.skills = selectedSkills.map((skillName, index) => {
        const skill = availableSkills.find(s => s.name === skillName);
        return {
          skill_id: skill?.skill_id || index + 1000,
          name: skillName
        };
      });

      setJob(updatedJob);
      setEditDialogOpen(false);

      alert('Job updated successfully!');

    } catch (err) {
      console.error('Error updating job:', err);
      alert('Failed to update job. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await FetchEndpoint(`/job/jobs/${jobId}`, 'GET', null, null);

        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const jobData: JobDetails = await response.json();
        setJob(jobData);

        const savedBookmarks = localStorage.getItem('bookmarkedJobs');
        if (savedBookmarks) {
          const bookmarks = JSON.parse(savedBookmarks);
          setBookmarked(bookmarks.includes(jobId));
        }

      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setCvFile(file);
    }
  };

  const handleApply = async () => {
    if (!cvFile) {
      alert('Please upload your CV first');
      return;
    }

    setApplying(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token || !userData) {
        alert('Please login to apply for jobs');
        navigate('/login');
        return;
      }

      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });
      };

      const cvBase64 = await convertFileToBase64(cvFile);

      const applicationData = {
        job_id: jobId!,
        cv_file: cvBase64,
        cv_filename: cvFile.name,
        cv_type: cvFile.type,
        cover_letter: coverLetter
      };

      const response = await FetchEndpoint('/job-applications/apply', 'POST', token, applicationData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setApplySuccess(true);
      setTimeout(() => {
        setApplyDialogOpen(false);
        setApplySuccess(false);
        setCvFile(null);
        setCoverLetter('');
      }, 2000);

    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const toggleBookmark = () => {
    const savedBookmarks = localStorage.getItem('bookmarkedJobs');
    let bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];

    if (bookmarked) {
      bookmarks = bookmarks.filter((id: string) => id !== jobId);
    } else {
      bookmarks.push(jobId);
    }

    localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));
    setBookmarked(!bookmarked);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #B3E5FC 0%, #4FC3F7 50%, #03A9F4 100%)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B3E5FC 0%, #4FC3F7 50%, #03A9F4 100%)',
        py: 4
      }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Job not found'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Container>
      </Box>
    );
  }

  // ✅ FIXED: Check if user owns this job post using correct field
  const isOwnJob = userData && userType === 'recruiter' && job.recruiter_id === userData.user_id;

  // Main render
  return (
    <>
      {/* Background */}
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with Back Button and Bookmark */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            Back
          </Button>

          <Tooltip title={bookmarked ? "Remove bookmark" : "Save job"}>
            <IconButton
              onClick={toggleBookmark}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              {bookmarked ? (
                <BookmarkIcon color="primary" />
              ) : (
                <BookmarkBorderIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={4}>
          {/* Main Job Details */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={800}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Job Header */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#0277BD',
                      mb: 2
                    }}
                  >
                    {job.title}
                  </Typography>

                  {/* Company Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.primary">
                      {job.company?.name || 'Company Name Not Available'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      {job.company?.address || 'Location Not Available'}
                    </Typography>
                  </Box>

                  {/* Job Meta Info */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    <Chip
                      icon={<WorkIcon />}
                      label={job.type?.type || 'Job Type'}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />

                    <Chip
                      icon={<CategoryIcon />}
                      label={job.category?.category || 'Category'}
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />

                    <Chip
                      icon={<TimerIcon />}
                      label={formatPostedDate(job.posted_date)}
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Job Description */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: '#0277BD',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 3
                    }}
                  >
                    <DescriptionIcon />
                    Job Description
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: 'text.primary',
                      whiteSpace: 'pre-wrap',
                      fontSize: '1.05rem'
                    }}
                  >
                    {job.description}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Required Skills */}
                {job.skills && job.skills.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: '#0277BD',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3
                      }}
                    >
                      <SkillsIcon />
                      Required Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {job.skills.map((skill) => (
                        <Chip
                          key={skill.skill_id}
                          label={skill.name}
                          sx={{
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            color: '#7B1FA2',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            height: 36,
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: 'rgba(156, 39, 176, 0.15)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 8px rgba(156, 39, 176, 0.2)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Fade>
          </Grid>

          {/* Sidebar - Apply Section */}
          <Grid item xs={12} md={4}>
            <Zoom in timeout={1000}>
              <Card
                elevation={3}
                sx={{
                  position: 'sticky',
                  top: 20,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* SALARY DISPLAY - Always shown */}
                  {formatSalary(job) && (
                    <Box
                      sx={{
                        textAlign: 'center',
                        mb: 3,
                        p: 3,
                        backgroundColor: 'rgba(76, 175, 80, 0.08)',
                        borderRadius: 2,
                        border: '1px solid rgba(76, 175, 80, 0.2)'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Salary Range
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#2E7D32'
                        }}
                      >
                        {formatSalary(job)}
                      </Typography>
                    </Box>
                  )}

                  {/* ✅ FIXED: Use correct userType field from AuthContext */}
                  {isAuthenticated && userType === 'applier' ? (
                    // ✅ APPLIER (JOB SEEKER) - Show apply button
                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          color: '#0277BD',
                          mb: 3,
                          textAlign: 'center'
                        }}
                      >
                        Apply for this Job
                      </Typography>

                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={() => setApplyDialogOpen(true)}
                        sx={{
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 15px rgba(3, 169, 244, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(3, 169, 244, 0.4)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Apply Now
                      </Button>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textAlign: 'center',
                          mt: 2,
                          fontStyle: 'italic'
                        }}
                      >
                        Upload your CV and submit your application
                      </Typography>
                    </>
                  ) : (
                    // ✅ ALL OTHER USERS (RECRUITER, NOT LOGGED IN, COMPANY) - Just show info
                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          color: userType === 'recruiter' ? '#FF6B35' : '#0277BD',
                          mb: 3,
                          textAlign: 'center'
                        }}
                      >
                        {userType === 'recruiter' ? 'Recruiter View' :
                          userType === 'company' ? 'Company View' :
                            'Job Information'}
                      </Typography>

                      {userType === 'recruiter' ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                          <Typography variant="body2">
                            <strong>Recruiter View:</strong> Can see applier and edit job.
                          </Typography>
                        </Alert>
                      ) : userType === 'company' ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                          <Typography variant="body2">
                            <strong>Company View:</strong> Just can see job.
                          </Typography>
                        </Alert>
                      ) : (
                        <Alert severity="info" sx={{ mb: 3 }}>
                          <Typography variant="body2">
                            <strong>Job Information:</strong> Please log in as an applicant to apply.
                          </Typography>
                        </Alert>
                      )}

                      {/* ✅ SHOW MANAGEMENT BUTTONS IF OWN JOB */}
                      {isOwnJob && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="medium"
                            fullWidth
                            onClick={handleViewApplications}
                            sx={{
                              py: 1,
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              borderRadius: 2,
                              textTransform: 'none'
                            }}
                          >
                            View Applications
                          </Button>

                          {/* ✅ NEW: Edit Job Button with popup */}
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="medium"
                            fullWidth
                            onClick={handleOpenEditDialog}
                            startIcon={<EditIcon />}
                            sx={{
                              py: 1,
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              borderRadius: 2,
                              textTransform: 'none'
                            }}
                          >
                            Edit Job Details
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* ✅ NEW: Applications Dialog */}
        {isAuthenticated && userType === 'recruiter' && isOwnJob && (
          <Dialog
            open={applicationsDialogOpen}
            onClose={() => setApplicationsDialogOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                minHeight: '600px'
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#0277BD' }}>
                    Job Applications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job?.title} - {applications.length} applications received
                  </Typography>
                </Box>
                <IconButton onClick={() => setApplicationsDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
              {loadingApplications ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                  <CircularProgress size={50} />
                </Box>
              ) : applications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <ApplicationIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No Applications Yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Applications will appear here when candidates apply for this job position.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', height: '500px' }}>
                  {/* Left Panel - Applications List */}
                  <Box sx={{ width: '40%', borderRight: '1px solid rgba(0,0,0,0.12)', overflow: 'auto' }}>
                    <List sx={{ py: 0 }}>
                      {applications.map((application, index) => (
                        <ListItem
                          key={application.id}  // ✅ Tambah key
                          button
                          selected={selectedApplication?.id === application.id}
                          onClick={() => setSelectedApplication(application)}  // ✅ Tambah onClick
                          sx={{
                            borderBottom: index < applications.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                            py: 2,
                            px: 3,
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              borderRight: '3px solid #1976d2'
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.04)'
                            }
                          }}
                        >
                          <ListItemText
                            primary={application.applier.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span">{application.applier.email}</Typography>
                                <Chip
                                  size="small"
                                  label={application.status.toUpperCase()}
                                  color={getStatusColor(application.status)}
                                  icon={getStatusIcon(application.status)}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Right Panel - Application Details */}
                  <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                    {selectedApplication ? (
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {selectedApplication.applier.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {selectedApplication.applier.email}
                        </Typography>

                        {selectedApplication.cv_available && (
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => downloadCV(selectedApplication.id, selectedApplication.applier.name)}
                            sx={{ mt: 2, mb: 3 }}
                          >
                            Download CV
                          </Button>
                        )}

                        {selectedApplication.cover_letter && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              Cover Letter:
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                              {selectedApplication.cover_letter}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Update Status:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {['applied', 'interviewing', 'rejected'].map((status) => {
                              // Disable "Applied" if status is not "applied"
                              const disableApplied =
                                status === 'applied' &&
                                (selectedApplication.status === 'interviewing' ||
                                  selectedApplication.status === 'rejected');
                              return (
                                <Button
                                  key={status}
                                  variant={selectedApplication.status === status ? 'contained' : 'outlined'}
                                  size="small"
                                  color={getStatusColor(status)}
                                  disabled={updatingStatus === selectedApplication.id || disableApplied}
                                  onClick={() => updateApplicationStatus(selectedApplication.id, status)}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                              );
                            })}

                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disabled={
                                updatingStatus === selectedApplication.id ||
                                selectedApplication.status === 'rejected' ||
                                selectedApplication.status === 'interviewing'
                              }
                              onClick={async () => {
                                if (
                                  selectedApplication.status === 'rejected' ||
                                  selectedApplication.status === 'interviewing'
                                ) {
                                  alert('You cannot finish an application that is rejected or interviewing.');
                                  return;
                                }
                                if (window.confirm('Are you sure you want to finish (delete) this application?')) {
                                  setUpdatingStatus(selectedApplication.id);
                                  try {
                                    const token = localStorage.getItem('accessToken');
                                    const response = await FetchEndpoint(
                                      `/job-applications/cancel/${selectedApplication.id}`,
                                      'DELETE',
                                      token,
                                      null
                                    );
                                    if (!response.ok) {
                                      throw new Error('Failed to delete application');
                                    }
                                    await fetchApplications();
                                    setSelectedApplication(null);
                                  } catch (err) {
                                    alert('Failed to delete application.');
                                  } finally {
                                    setUpdatingStatus(null);
                                  }
                                }
                              }}
                            >
                              Finished
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 10 }}>
                        <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6">Select an application to view details</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setApplicationsDialogOpen(false)}>Close</Button>
              <Button variant="contained" onClick={fetchApplications}>Refresh</Button>
            </DialogActions>
          </Dialog>
        )}
        {/* Apply Dialog - Only for appliers */}
        {isAuthenticated && userType === 'applier' && (
          <Dialog
            open={applyDialogOpen}
            onClose={() => !applying && setApplyDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                minHeight: '400px'
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#0277BD' }}>
                Apply for {job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                at {job.company?.name}
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
              {applySuccess ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Application Submitted Successfully!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The employer will review your application and contact you soon.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* CV Upload Section */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Upload your CV (PDF only) *
                    </Typography>
                    <Box
                      sx={{
                        border: cvFile ? '2px solid #4caf50' : '2px dashed #ccc',
                        borderRadius: 2,
                        mr: 50,
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: cvFile ? 'rgba(76, 175, 80, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: cvFile ? 'rgba(76, 175, 80, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          borderColor: cvFile ? '#4caf50' : '#999'
                        }
                      }}
                      onClick={() => document.getElementById('cv-upload')?.click()}
                    >
                      <input
                        id="cv-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />

                      {cvFile ? (
                        <Box>
                          <PdfIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                            {cvFile.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                            ✓ Ready to submit
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body1" gutterBottom>
                            Click to upload your CV
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            PDF files only, max 5MB
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Cover Letter */}
                  <Box sx={{ ml: 59, mt: -28.5 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Cover Letter (Optional)
                    </Typography>
                    <TextField
                      multiline
                      rows={6}
                      fullWidth
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                      sx={{
                        '& .MuiOutlinedInput-root': {

                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>

                  {/* Requirements Notice */}
                  <Alert severity="info" sx={{ mt: 0 }}>
                    <Typography variant="body2">
                      <strong>Application Requirements:</strong>
                      <br />• CV must be in PDF format
                      <br />• File size should be less than 5MB
                      <br />• Make sure your contact information is included
                    </Typography>
                  </Alert>
                </Box>
              )}
            </DialogContent>

            {!applySuccess && (
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                  onClick={() => setApplyDialogOpen(false)}
                  disabled={applying}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApply}
                  disabled={!cvFile || applying}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1
                  }}
                  startIcon={applying ? <CircularProgress size={20} /> : <UploadIcon />}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </DialogActions>
            )}
          </Dialog>
        )}

        {/* ✅ UPDATED: Enhanced Edit Job Dialog with Skills and Salary Validation */}
        <Dialog
          open={editDialogOpen}
          onClose={() => !editSaving && setEditDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#0277BD' }}>
              Edit Job Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update salary, category, job type, and skills
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Salary Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0277BD' }}>
                  Salary Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Minimum Salary"
                      type="number"
                      value={editData.salary_min}
                      onChange={(e) => setEditData(prev => ({ ...prev, salary_min: e.target.value }))}
                      error={!validateSalary().isValid}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Maximum Salary"
                      type="number"
                      value={editData.salary_max}
                      onChange={(e) => setEditData(prev => ({ ...prev, salary_max: e.target.value }))}
                      error={!validateSalary().isValid}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Salary Type</InputLabel>
                      <Select
                        value={editData.salary_type}
                        label="Salary Type"
                        onChange={(e) => setEditData(prev => ({ ...prev, salary_type: e.target.value }))}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="hourly">Per Hour</MenuItem>
                        <MenuItem value="daily">Per Day</MenuItem>
                        <MenuItem value="monthly">Per Month</MenuItem>
                        <MenuItem value="yearly">Per Year</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* ✅ NEW: Salary validation error */}
                {!validateSalary().isValid && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {validateSalary().message}
                  </Alert>
                )}
              </Box>

              <Divider />

              {/* Category and Type Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0277BD' }}>
                  Job Classification
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editData.category_id}
                        label="Category"
                        onChange={(e) => setEditData(prev => ({ ...prev, category_id: e.target.value }))}
                        sx={{ borderRadius: 2 }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.category_id} value={category.category_id}>
                            {category.category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Job Type</InputLabel>
                      <Select
                        value={editData.type_id}
                        label="Job Type"
                        onChange={(e) => setEditData(prev => ({ ...prev, type_id: e.target.value }))}
                        sx={{ borderRadius: 2 }}
                      >
                        {jobTypes.map((type) => (
                          <MenuItem key={type.type_id} value={type.type_id}>
                            {type.type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* ✅ NEW: Skills Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0277BD' }}>
                  Required Skills
                </Typography>

                {/* Current Selected Skills */}
                {selectedSkills.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Selected Skills ({selectedSkills.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedSkills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          onDelete={() => handleRemoveSkill(skill)}
                          color="primary"
                          variant="filled"
                          size="small"
                          deleteIcon={<DeleteIcon />}
                          sx={{
                            '& .MuiChip-deleteIcon': {
                              fontSize: '18px'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Skill Search */}
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    label="Search or Add Skills"
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                    placeholder="Type to search existing skills or create new ones..."
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: skillSearchTerm.trim() && (
                        <InputAdornment position="end">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddNewSkill()}
                            sx={{
                              ml: 1,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              px: 2
                            }}
                          >
                            Create "{skillSearchTerm.trim()}"
                          </Button>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        paddingRight: skillSearchTerm.trim() ? 1 : 2
                      }
                    }}
                  />

                  {/* Skills Suggestions */}
                  {showSuggestions && (
                    <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                      <Paper
                        elevation={8}
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1300,
                          maxHeight: '200px',
                          overflow: 'auto',
                          mt: 1,
                          border: '1px solid rgba(0,0,0,0.12)'
                        }}
                      >
                        {filteredSkills.length > 0 ? (
                          <>
                            <Box sx={{ p: 1, backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                                Existing Skills - Click to select:
                              </Typography>
                            </Box>
                            {filteredSkills.map((skill) => (
                              <Box
                                key={skill.skill_id}
                                onClick={() => handleSkillSelect(skill.name)}
                                sx={{
                                  p: 2,
                                  cursor: 'pointer',
                                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                  },
                                  '&:last-child': {
                                    borderBottom: 'none'
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <SearchIcon fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {skill.name}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </>
                        ) : (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              No existing skills found for "{skillSearchTerm}"
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </ClickAwayListener>
                  )}
                </Box>

                {/* Skills validation */}
                {selectedSkills.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Please select at least one required skill for this job position.
                    </Typography>
                  </Alert>
                )}

                {selectedSkills.length > 0 && (
                  <Box sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    borderRadius: 1,
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                      ✓ {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Preview */}
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Preview:</strong> Your changes will be reflected immediately after saving.
                  Leave salary fields empty if you prefer not to display salary information.
                </Typography>
              </Alert>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              disabled={editSaving}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEditSubmit}
              disabled={
                editSaving ||
                !editData.category_id ||
                !editData.type_id ||
                selectedSkills.length === 0 ||
                !validateSalary().isValid
              }
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1
              }}
              startIcon={editSaving ? <CircularProgress size={20} /> : <EditIcon />}
            >
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default JobDetail;