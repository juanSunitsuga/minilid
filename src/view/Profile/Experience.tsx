import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button, 
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Fade,
  Tooltip,
  Card,
  CardContent,
  Skeleton
} from '@mui/material';
import { 
  Add as AddIcon, 
  BusinessCenter, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn,
  CalendarToday,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  WorkOutline,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { FetchEndpoint } from '../FetchEndpoint';

// Updated interface to match your Experiences model
interface Experience {
  experience_id: string;
  user_id: string;
  user_type: 'applier' | 'recruiter';
  company_name: string;
  job_title: string;
  start_date: string | Date;
  end_date?: string | Date | null;
  description?: string | null;
}

interface ExperienceProps {
  userId?: string;
  userType?: 'applier' | 'recruiter';
  experiences?: Experience[];
  onAddExperience?: () => void;
  onEditExperience?: (experience: Experience) => void;
  readonly?: boolean;
}

const Experience: React.FC<ExperienceProps> = ({ 
  userId, 
  userType, 
  experiences: propExperiences = [],
  onAddExperience,
  onEditExperience,
  readonly = false
}) => {
  const [experiences, setExperiences] = useState<Experience[]>(propExperiences);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  });

  // UI states
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Format date for display
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Present';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format date for input (YYYY-MM)
  const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Calculate duration
  const calculateDuration = (startDate: string | Date, endDate?: string | Date | null): string => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();
    
    const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                        (end.getMonth() - start.getMonth());
    
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
    
    if (years === 0) {
      return months === 1 ? '1 mo' : `${months} mos`;
    } else if (months === 0) {
      return years === 1 ? '1 yr' : `${years} yrs`;
    } else {
      return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      company_name: '',
      job_title: '',
      start_date: '',
      end_date: '',
      description: '',
      is_current: false
    });
    setDialogError(null);
  };

  // Handle dialog open for adding
  const handleAddClick = () => {
    setIsEditing(false);
    setEditingExperience(null);
    resetForm();
    setDialogOpen(true);
  };

  // Handle dialog open for editing
  const handleEditClick = (experience: Experience) => {
    setIsEditing(true);
    setEditingExperience(experience);
    setFormData({
      company_name: experience.company_name,
      job_title: experience.job_title,
      start_date: formatDateForInput(experience.start_date),
      end_date: formatDateForInput(experience.end_date),
      description: experience.description || '',
      is_current: !experience.end_date
    });
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (dialogLoading) return;
    setDialogOpen(false);
    resetForm();
    setIsEditing(false);
    setEditingExperience(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle current job checkbox
  const handleCurrentJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      is_current: isChecked,
      end_date: isChecked ? '' : prev.end_date
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    setDialogError(null);

    if (!formData.company_name.trim()) {
      setDialogError('Company name is required');
      return false;
    }

    if (!formData.job_title.trim()) {
      setDialogError('Job title is required');
      return false;
    }

    if (!formData.start_date) {
      setDialogError('Start date is required');
      return false;
    }

    if (!formData.is_current && !formData.end_date) {
      setDialogError('End date is required for past positions');
      return false;
    }

    if (!formData.is_current && formData.end_date && formData.start_date >= formData.end_date) {
      setDialogError('End date must be after start date');
      return false;
    }

    return true;
  };

  // Handle form submission - FIXED TO CONNECT TO BACKEND
  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!userId || !userType) {
      setDialogError('User information is missing');
      return;
    }

    setDialogLoading(true);
    setDialogError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Prepare data following the profile routes pattern
      const submitData = {
        [`${userType}_id`]: userId, // applier_id or recruiter_id
        company_name: formData.company_name.trim(),
        job_title: formData.job_title.trim(),
        start_date: formData.start_date + '-01',
        end_date: formData.is_current ? null : (formData.end_date + '-01'),
        description: formData.description.trim() || null
      };

      console.log('Submitting experience data:', submitData);

      let response;
      let endpoint;

      if (isEditing && editingExperience) {
        // Update existing experience - UPDATED TO MATCH PROFILE ROUTES
        endpoint = `/experiences/${userType}s-experiences/${editingExperience.experience_id}`;
        const updateData = {
          company_name: submitData.company_name,
          job_title: submitData.job_title,
          start_date: submitData.start_date,
          end_date: submitData.end_date,
          description: submitData.description
        };
        
        console.log('Updating experience with endpoint:', endpoint, updateData);
        response = await FetchEndpoint(endpoint, 'PUT', token, updateData);
      } else {
        // Create new experience - UPDATED TO MATCH PROFILE ROUTES
        endpoint = `/experiences/${userType}s-experiences`;
        console.log('Creating experience with endpoint:', endpoint);
        response = await FetchEndpoint(endpoint, 'POST', token, submitData);
      }

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to save experience');
      }

      const data = await response.json();
      console.log('Success response:', data);

      // Update local state with the response data
      if (isEditing && editingExperience) {
        setExperiences(prev => prev.map(exp => 
          exp.experience_id === editingExperience.experience_id ? data.data : exp
        ));
      } else {
        setExperiences(prev => [data.data, ...prev]);
      }

      // Call parent callbacks if provided
      if (isEditing && onEditExperience) {
        onEditExperience(data.data);
      } else if (onAddExperience) {
        onAddExperience();
      }

      // Close dialog
      handleDialogClose();

    } catch (error: any) {
      console.error('Error saving experience:', error);
      setDialogError(error.message || 'Failed to save experience');
    } finally {
      setDialogLoading(false);
    }
  };

  // Fetch experiences from API - FIXED TO ADD QUERY PARAMETERS
  const fetchExperiences = async () => {
    if (!userId || !userType) {
        console.log('Missing userId or userType for fetching experiences');
        return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // UPDATED TO MATCH PROFILE ROUTES PATTERN
        const endpoint = `/experiences/${userType}s-experiences?${userType}_id=${userId}`;
        console.log('Fetching experiences from:', endpoint);

        const response = await FetchEndpoint(endpoint, 'GET', token);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch error response:', errorData);
            throw new Error(errorData.message || 'Failed to fetch experiences');
        }

        const data = await response.json();
        console.log('Fetch success response:', data);

        setExperiences(data.data || []);
    } catch (error: any) {
        console.error('Error fetching experiences:', error);
        setError(error.message || 'Failed to load experiences');
    } finally {
        setLoading(false);
    }
  };

  // Delete experience - CORRECTED ENDPOINT
  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // UPDATED TO MATCH PROFILE ROUTES PATTERN
      const endpoint = `/experiences/${userType}s-experiences/${experienceId}`;
      console.log('Deleting experience with endpoint:', endpoint);

      const response = await FetchEndpoint(endpoint, 'DELETE', token);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete error response:', errorData);
        throw new Error(errorData.message || 'Failed to delete experience');
      }

      const data = await response.json();
      console.log('Delete success response:', data);

      // Remove from local state
      setExperiences(prev => prev.filter(exp => exp.experience_id !== experienceId));
    } catch (error: any) {
      console.error('Error deleting experience:', error);
      setError(error.message || 'Failed to delete experience');
    }
  };

  // Load experiences on component mount
  useEffect(() => {
    console.log('Effect triggered with userId:', userId, 'userType:', userType);
    if (userId && userType) {
      fetchExperiences();
    }
  }, [userId, userType]);

  // Update experiences when prop changes
  useEffect(() => {
    if (propExperiences.length > 0) {
      setExperiences(propExperiences);
    }
  }, [propExperiences]);

  // Loading skeleton component
  const ExperienceSkeleton = () => (
    <Box>
      {[1, 2, 3].map((item) => (
        <Card key={item} sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="circular" width={56} height={56} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );

  // Debug info
  console.log('Experience component state:', {
    userId,
    userType,
    experiencesCount: experiences.length,
    loading,
    error
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 0, 
            borderRadius: 4, 
            mb: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            overflow: 'hidden'
          }}
        >
          {/* Enhanced Header */}
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 100%)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                }}
              >
                <WorkOutline />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary' }}>
                  Experience
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {experiences.length} {experiences.length === 1 ? 'position' : 'positions'}
                </Typography>
              </Box>
            </Box>
            
            {!readonly && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Add Experience" arrow>
                  <IconButton 
                    onClick={handleAddClick}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'primary.dark',
                        transform: 'scale(1.05)'
                      },
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    size="medium"
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)',
                      border: '1px solid rgba(244, 67, 54, 0.2)'
                    }}
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {loading && <ExperienceSkeleton />}

            {/* Experience List */}
            {!loading && experiences && experiences.length > 0 ? (
              <Box>
                <AnimatePresence>
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.experience_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        sx={{ 
                          mb: 2,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: hoveredCard === exp.experience_id ? 'primary.main' : 'divider',
                          transition: 'all 0.3s ease',
                          transform: hoveredCard === exp.experience_id ? 'translateY(-2px)' : 'none',
                          boxShadow: hoveredCard === exp.experience_id 
                            ? '0 8px 24px rgba(33, 150, 243, 0.15)' 
                            : '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(33, 150, 243, 0.15)',
                          }
                        }}
                        onMouseEnter={() => setHoveredCard(exp.experience_id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', position: 'relative' }}>
                            {/* Enhanced Company Logo/Icon */}
                            <Avatar 
                              sx={{ 
                                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                mr: 3,
                                width: 64,
                                height: 64,
                                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                                border: '3px solid white'
                              }}
                            >
                              <BusinessCenter sx={{ fontSize: 32, color: 'white' }} />
                            </Avatar>

                            {/* Experience Details */}
                            <Box sx={{ flex: 1 }}>
                              {/* Job Title */}
                              <Typography 
                                variant="h6" 
                                fontWeight="700" 
                                sx={{ 
                                  mb: 0.5, 
                                  color: 'text.primary',
                                  lineHeight: 1.3
                                }}
                              >
                                {exp.job_title}
                              </Typography>

                              {/* Company Name and Employment Type */}
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: 'text.secondary', 
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                  }}
                                >
                                  {exp.company_name}
                                </Typography>
                                <Chip 
                                  label="Full-time" 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    height: 24,
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'primary.dark'
                                    }
                                  }}
                                />
                              </Box>

                              {/* Date Range and Duration */}
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <CalendarToday sx={{ fontSize: 18, color: 'primary.main' }} />
                                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    •
                                  </Typography>
                                  <Chip
                                    label={calculateDuration(exp.start_date, exp.end_date)}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      bgcolor: 'success.light',
                                      color: 'success.dark',
                                      fontWeight: 600
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* Location */}
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 0.8 }}>
                                <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  Remote • Hybrid
                                </Typography>
                              </Box>

                              {/* Description */}
                              {exp.description && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography 
                                    variant="body2" 
                                    color="text.primary"
                                    sx={{ 
                                      lineHeight: 1.7,
                                      fontSize: '0.9rem',
                                      maxHeight: expandedCard === exp.experience_id ? 'none' : 80,
                                      overflow: 'hidden',
                                      position: 'relative',
                                      transition: 'max-height 0.3s ease'
                                    }}
                                  >
                                    {exp.description}
                                  </Typography>
                                  
                                  {exp.description.length > 150 && (
                                    <Button
                                      variant="text"
                                      size="small"
                                      onClick={() => setExpandedCard(
                                        expandedCard === exp.experience_id ? null : exp.experience_id
                                      )}
                                      sx={{ 
                                        mt: 1,
                                        p: 0,
                                        textTransform: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        '&:hover': {
                                          bgcolor: 'transparent',
                                          color: 'primary.dark'
                                        }
                                      }}
                                    >
                                      {expandedCard === exp.experience_id ? '...see less' : '...see more'}
                                    </Button>
                                  )}
                                </Box>
                              )}
                            </Box>

                            {/* Enhanced Action Buttons */}
                            {!readonly && (
                              <Fade in={hoveredCard === exp.experience_id || true}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: 1, 
                                  ml: 2,
                                  alignSelf: 'flex-start'
                                }}>
                                  <Tooltip title="Edit Experience" arrow>
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleEditClick(exp)}
                                      sx={{ 
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': { 
                                          bgcolor: 'primary.light',
                                          borderColor: 'primary.main',
                                          color: 'primary.main',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title="Delete Experience" arrow>
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleDeleteExperience(exp.experience_id)}
                                      sx={{ 
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        color: 'text.secondary',
                                        '&:hover': { 
                                          bgcolor: 'error.light',
                                          borderColor: 'error.main',
                                          color: 'error.main',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Fade>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            ) : !loading ? (
              // Enhanced Empty state
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'primary.light'
                }}>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.light', 
                        mx: 'auto', 
                        mb: 3,
                        width: 80,
                        height: 80,
                        boxShadow: '0 8px 24px rgba(33, 150, 243, 0.2)'
                      }}
                    >
                      <BusinessCenter sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Avatar>
                  </motion.div>
                  
                  <Typography variant="h5" fontWeight="700" sx={{ mb: 1, color: 'text.primary' }}>
                    Start building your experience
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                    Showcase your professional journey and highlight the experiences that make you stand out.
                  </Typography>
                  
                  {!readonly && (
                    <Button 
                      variant="contained"
                      size="large"
                      sx={{ 
                        borderRadius: 3, 
                        px: 6,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)',
                        background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(33, 150, 243, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                      startIcon={<AddIcon />}
                      onClick={handleAddClick}
                    >
                      Add your first experience
                    </Button>
                  )}
                </Box>
              </motion.div>
            ) : null}

            {/* Add Position Button (when experiences exist) */}
            {!readonly && experiences.length > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button 
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderRadius: 3, 
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      border: '2px solid',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.light',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                  >
                    Add another position
                  </Button>
                </Box>
              </motion.div>
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Enhanced Experience Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
          transition: { duration: 0.3 },
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 4, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              {isEditing ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700">
                {isEditing ? 'Edit Experience' : 'Add Experience'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isEditing ? 'Update your experience details' : 'Share your professional journey'}
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleDialogClose}
            disabled={dialogLoading}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <AnimatePresence>
            {dialogError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)' 
                  }}
                  onClose={() => setDialogError(null)}
                >
                  {dialogError}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Grid container spacing={3}>
            {/* Job Title */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="job_title"
                name="job_title"
                label="Job Title"
                value={formData.job_title}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }
                }}
              />
            </Grid>

            {/* Company Name */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="company_name"
                name="company_name"
                label="Company Name"
                value={formData.company_name}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }
                }}
              />
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="start_date"
                name="start_date"
                label="Start Date"
                type="month"
                value={formData.start_date}
                onChange={handleInputChange}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="end_date"
                name="end_date"
                label="End Date"
                type="month"
                value={formData.end_date}
                onChange={handleInputChange}
                variant="outlined"
                disabled={formData.is_current}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
              />
            </Grid>

            {/* Current Job Checkbox */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_current}
                    onChange={handleCurrentJobChange}
                    name="is_current"
                    sx={{
                      '&.Mui-checked': {
                        color: 'primary.main',
                      }
                    }}
                  />
                }
                label="I am currently working in this role"
                sx={{ 
                  '& .MuiFormControlLabel-label': {
                    fontSize: '1rem',
                    fontWeight: 500
                  }
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                variant="outlined"
                placeholder="Describe your role, responsibilities, and key achievements..."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          px: 4, 
          py: 3, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          gap: 2
        }}>
          <Button 
            onClick={handleDialogClose}
            disabled={dialogLoading}
            startIcon={<CancelIcon />}
            sx={{ 
              borderRadius: 3, 
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              borderRadius: 3, 
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
              '&:hover': { 
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {dialogLoading ? 'Saving...' : (isEditing ? 'Update Experience' : 'Add Experience')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Experience;