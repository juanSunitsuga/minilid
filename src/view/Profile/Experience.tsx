import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button, 
  Avatar,
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
  Menu,
  MenuItem,
  Skeleton
} from '@mui/material';
import { 
  Add as AddIcon, 
  BusinessCenter, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  WorkOutline
} from '@mui/icons-material';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  });

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
    setMenuAnchor(null);
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

  // Handle menu
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, exp: Experience) => {
    event.stopPropagation();
    setSelectedExperience(exp);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedExperience(null);
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

  // Handle form submission
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

      const submitData = {
        [`${userType}_id`]: userId,
        company_name: formData.company_name.trim(),
        job_title: formData.job_title.trim(),
        start_date: formData.start_date + '-01',
        end_date: formData.is_current ? null : (formData.end_date + '-01'),
        description: formData.description.trim() || null
      };

      let response;
      let endpoint;

      if (isEditing && editingExperience) {
        endpoint = `/experiences/${userType}s-experiences/${editingExperience.experience_id}`;
        const updateData = {
          company_name: submitData.company_name,
          job_title: submitData.job_title,
          start_date: submitData.start_date,
          end_date: submitData.end_date,
          description: submitData.description
        };
        
        response = await FetchEndpoint(endpoint, 'PUT', token, updateData);
      } else {
        endpoint = `/experiences/${userType}s-experiences`;
        response = await FetchEndpoint(endpoint, 'POST', token, submitData);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save experience');
      }

      const data = await response.json();

      if (isEditing && editingExperience) {
        setExperiences(prev => prev.map(exp => 
          exp.experience_id === editingExperience.experience_id ? data.data : exp
        ));
      } else {
        setExperiences(prev => [data.data, ...prev]);
      }

      if (isEditing && onEditExperience) {
        onEditExperience(data.data);
      } else if (onAddExperience) {
        onAddExperience();
      }

      handleDialogClose();

    } catch (error: any) {
      console.error('Error saving experience:', error);
      setDialogError(error.message || 'Failed to save experience');
    } finally {
      setDialogLoading(false);
    }
  };

  // Fetch experiences from API
  const fetchExperiences = async () => {
    if (!userId || !userType) return;
    
    setLoading(true);
    setError(null);
    
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const endpoint = `/experiences/${userType}s-experiences?${userType}_id=${userId}`;
        const response = await FetchEndpoint(endpoint, 'GET', token);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch experiences');
        }

        const data = await response.json();
        setExperiences(data.data || []);
    } catch (error: any) {
        console.error('Error fetching experiences:', error);
        setError(error.message || 'Failed to load experiences');
    } finally {
        setLoading(false);
    }
  };

  // Delete experience
  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const endpoint = `/experiences/${userType}s-experiences/${experienceId}`;
      const response = await FetchEndpoint(endpoint, 'DELETE', token);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete experience');
      }

      setExperiences(prev => prev.filter(exp => exp.experience_id !== experienceId));
      setMenuAnchor(null);
    } catch (error: any) {
      console.error('Error deleting experience:', error);
      setError(error.message || 'Failed to delete experience');
    }
  };

  // Load experiences on component mount
  useEffect(() => {
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
        <Box key={item} sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="100%" height={16} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="80%" height={16} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WorkOutline sx={{ color: 'text.secondary' }} />
            <Typography variant="h6" fontWeight="600">
              Experience
            </Typography>
          </Box>
          
          {!readonly && (
            <IconButton 
              onClick={handleAddClick}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  color: 'primary.main',
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <AddIcon />
            </IconButton>
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && <ExperienceSkeleton />}

          {/* Experience List */}
          {!loading && experiences && experiences.length > 0 ? (
            <Box>
              {experiences.map((exp, index) => (
                <Box key={exp.experience_id}>
                  <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
                    {/* Company Logo */}
                    <Avatar 
                      sx={{ 
                        bgcolor: 'grey.200',
                        color: 'grey.600',
                        width: 48,
                        height: 48
                      }}
                    >
                      <BusinessCenter />
                    </Avatar>

                    {/* Experience Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Job Title */}
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="600" 
                        sx={{ lineHeight: 1.3 }}
                      >
                        {exp.job_title}
                      </Typography>

                      {/* Company Name */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {exp.company_name}
                      </Typography>

                      {/* Duration */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {formatDate(exp.start_date)} - {formatDate(exp.end_date)} · {calculateDuration(exp.start_date, exp.end_date)}
                      </Typography>

                      {/* Description */}
                      {exp.description && (
                        <Box sx={{ mt: 1 }}>
                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ 
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: expandedDescription === exp.experience_id ? 'none' : 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {exp.description}
                          </Typography>
                          
                          {exp.description.length > 150 && (
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => setExpandedDescription(
                                expandedDescription === exp.experience_id ? null : exp.experience_id
                              )}
                              sx={{ 
                                mt: 0.5,
                                p: 0,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'text.secondary',
                                '&:hover': {
                                  bgcolor: 'transparent',
                                  color: 'primary.main'
                                }
                              }}
                            >
                              {expandedDescription === exp.experience_id ? '...see less' : '...see more'}
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Action Menu */}
                    {!readonly && (
                      <Box>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuClick(e, exp)}
                          sx={{ 
                            color: 'text.secondary',
                            '&:hover': { 
                              color: 'text.primary',
                              bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <MoreHorizIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  
                  {index < experiences.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </Box>
          ) : !loading ? (
            // Empty state
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: 'text.secondary'
            }}>
              <BusinessCenter sx={{ fontSize: 48, mb: 2, color: 'text.disabled' }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                No work experience added yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Share your professional journey and highlight the experiences that make you stand out.
              </Typography>
              
              {!readonly && (
                <Button 
                  variant="outlined"
                  onClick={handleAddClick}
                  startIcon={<AddIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Add experience
                </Button>
              )}
            </Box>
          ) : null}

          {/* Add More Button */}
          {!readonly && experiences.length > 0 && !loading && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button 
                variant="outlined"
                onClick={handleAddClick}
                startIcon={<AddIcon />}
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'text.secondary',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }
                }}
              >
                Add experience
              </Button>
            </Box>
          )}
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem 
            onClick={() => selectedExperience && handleEditClick(selectedExperience)}
            sx={{ fontSize: '0.875rem' }}
          >
            <EditIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Edit
          </MenuItem>
          <MenuItem 
            onClick={() => selectedExperience && handleDeleteExperience(selectedExperience.experience_id)}
            sx={{ fontSize: '0.875rem', color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Delete
          </MenuItem>
        </Menu>
      </Paper>

      {/* Experience Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2
        }}>
          <Typography variant="h6" fontWeight="600">
            {isEditing ? 'Edit experience' : 'Add experience'}
          </Typography>
          <IconButton onClick={handleDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {dialogError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Title"
                name="job_title"
                value={formData.job_title}
                onChange={handleInputChange}
                placeholder="Ex: Software Engineer"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Company"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Ex: Microsoft"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                required
                fullWidth
                label="Start date"
                name="start_date"
                type="month"
                value={formData.start_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End date"
                name="end_date"
                type="month"
                value={formData.end_date}
                onChange={handleInputChange}
                disabled={formData.is_current}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_current"
                    checked={formData.is_current}
                    onChange={handleCurrentJobChange}
                  />
                }
                label="I am currently working in this role"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your responsibilities and achievements..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleDialogClose} 
            disabled={dialogLoading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={dialogLoading}
            sx={{ textTransform: 'none' }}
          >
            {dialogLoading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              isEditing ? 'Save' : 'Add experience'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Experience;