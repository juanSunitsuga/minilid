import React, { useState, useEffect, useCallback } from 'react';
import { FetchEndpoint } from './FetchEndpoint';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Alert,
  ClickAwayListener,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';

const PreviewBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  backgroundColor: 'rgba(245, 247, 250, 0.95)',
  position: 'sticky',
  top: theme.spacing(2),
  overflow: 'auto',
  maxHeight: 'calc(100vh - 100px)',
}));

const CreateJob: React.FC = () => {
  const theme = useTheme();

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category_id: '',
    type_id: '',
    salary_min: '',
    salary_max: '',
    salary_type: 'monthly',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<{ skill_id: number, name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobCategories, setJobCategories] = useState<{ category_id: number, name: string }[]>([]);
  const [availableSkills, setAvailableSkills] = useState<{ skill_id: number, name: string }[]>([]);
  const [jobTypes, setJobTypes] = useState<{ type_id: number, name: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingData, setFetchingData] = useState(true);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const validateSalary = useCallback(() => {
    const min = parseInt(jobData.salary_min);
    const max = parseInt(jobData.salary_max);

    if (!jobData.salary_min && !jobData.salary_max) {
      return { isValid: true, message: '' };
    }

    if (!jobData.salary_min || !jobData.salary_max) {
      return { isValid: true, message: '' };
    }

    if (min >= max) {
      return {
        isValid: false,
        message: 'Minimum salary must be less than maximum salary'
      };
    }

    return { isValid: true, message: '' };
  }, [jobData.salary_min, jobData.salary_max]);

  useEffect(() => {
    if (skillSearchTerm.trim() === '') {
      setFilteredSkills([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = availableSkills.filter(skill =>
      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
      !skills.includes(skill.name)
    );

    setFilteredSkills(filtered);
    setShowSuggestions(filtered.length > 0 || skillSearchTerm.trim().length > 0);
  }, [skillSearchTerm, availableSkills, skills]);

  const handleUnifiedChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;

    console.log(`Field changed: ${name} = ${value}`);

    if (name === 'salary_min' || name === 'salary_max') {
      const numValue = value as string;
      if (numValue !== '' && !/^\d+$/.test(numValue)) {
        return;
      }
    }

    setJobData(prevData => {
      const newData = {
        ...prevData,
        [name as string]: value as string
      };

      if (name === 'salary_min' || name === 'salary_max') {
        setTimeout(() => {
          const tempData = { ...newData };
          const tempMin = parseInt(tempData.salary_min || '0');
          const tempMax = parseInt(tempData.salary_max || '0');

          if (tempData.salary_min && tempData.salary_max && tempMin >= tempMax) {
            setError('Minimum salary must be less than maximum salary');
          } else {
            setError(prev => prev.includes('salary') ? '' : prev);
          }
        }, 0);
      }

      return newData;
    });
  }, []);

  const openSalaryDialog = useCallback(() => {
    setSalaryDialogOpen(true);
  }, []);

  const closeSalaryDialog = useCallback(() => {
    setSalaryDialogOpen(false);
  }, []);

  const handleSkillSelect = useCallback((skillName: string) => {
    if (!skills.includes(skillName)) {
      setSkills(prev => [...prev, skillName]);
    }
    setSkillSearchTerm('');
    setShowSuggestions(false);
  }, [skills]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  }, []);

  const handleAddNewSkill = useCallback(async (skillName?: string) => {
    const newSkillName = skillName || skillSearchTerm.trim();

    if (!newSkillName) return;

    const existingSkill = availableSkills.find(
      skill => skill.name.toLowerCase() === newSkillName.toLowerCase()
    );

    if (existingSkill) {
      if (!skills.includes(existingSkill.name)) {
        setSkills(prev => [...prev, existingSkill.name]);
      }
      setSkillSearchTerm('');
      setShowSuggestions(false);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setError('Authentication token not found');
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
        setSkills(prev => [...prev, formattedNewSkill.name]);
        setSkillSearchTerm('');
        setShowSuggestions(false);

        alert(`Skill "${formattedNewSkill.name}" added successfully!`);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add new skill');
      }
    } catch (err) {
      console.error('Error adding new skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to add new skill');
    } finally {
      setLoading(false);
    }
  }, [skillSearchTerm, availableSkills, skills]);

  const formatSalaryRange = useCallback(() => {
    const { salary_min, salary_max, salary_type } = jobData;

    if (!salary_min && !salary_max) {
      return 'Salary not specified';
    }

    const formatNumber = (num: string) => {
      if (!num) return '0';
      return new Intl.NumberFormat('id-ID').format(parseInt(num));
    };

    const typeLabel = {
      hourly: 'per hour',
      daily: 'per day',
      monthly: 'per month',
      yearly: 'per year'
    }[salary_type] || 'per month';

    if (salary_min && salary_max) {
      return `Rp ${formatNumber(salary_min)} - Rp ${formatNumber(salary_max)} ${typeLabel}`;
    } else if (salary_min) {
      return `From Rp ${formatNumber(salary_min)} ${typeLabel}`;
    } else if (salary_max) {
      return `Up to Rp ${formatNumber(salary_max)} ${typeLabel}`;
    }

    return 'Salary negotiable';
  }, [jobData.salary_min, jobData.salary_max, jobData.salary_type]);

  const getSalaryChipColor = useCallback(() => {
    if (jobData.salary_min || jobData.salary_max) {
      return 'success';
    }
    return 'default';
  }, [jobData.salary_min, jobData.salary_max]);

  const formatSkillsList = useCallback(() => {
    if (skills.length === 0) {
      return (
        <Box sx={{
          p: 2,
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: 1,
          border: '1px dashed rgba(0,0,0,0.12)'
        }}>
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No skills selected yet...
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        ))}
      </Box>
    );
  }, [skills]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let categoriesData;
        let skillsData;
        let typesData;
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setError('Authentication token not found');
          return;
        }

        try {
          const categoriesResponse = await FetchEndpoint('/job/job-categories', 'GET', token, null);
          if (categoriesResponse.ok) {
            categoriesData = await categoriesResponse.json();
          }
        } catch (err) {
          console.log("Failed to fetch job categories:", err);
        }

        try {
          const typesResponse = await FetchEndpoint('/job/job-types', 'GET', token, null);
          if (typesResponse.ok) {
            typesData = await typesResponse.json();
          }
        } catch (err) {
          console.log("Failed to fetch job types:", err);
        }

        try {
          const skillsResponse = await FetchEndpoint('/job/skills', 'GET', token, null);
          if (skillsResponse.ok) {
            skillsData = await skillsResponse.json();
          }
        } catch (err) {
          console.log("Failed to fetch skills:", err);
        }

        if (categoriesData) {
          const formattedCategories = Array.isArray(categoriesData) ?
            categoriesData.map(cat => ({
              category_id: cat.category_id,
              name: cat.category
            })) : [];

          setJobCategories(formattedCategories);

          if (formattedCategories.length > 0) {
            setJobData(prevData => ({
              ...prevData,
              category_id: formattedCategories[0].category_id.toString()
            }));
          }
        }

        if (typesData) {
          const formattedTypes = Array.isArray(typesData) ?
            typesData.map(type => ({
              type_id: type.type_id,
              name: type.type
            })) : [];

          setJobTypes(formattedTypes);

          if (formattedTypes.length > 0) {
            setJobData(prevData => ({
              ...prevData,
              type_id: formattedTypes[0].type_id.toString()
            }));
          }
        }

        if (skillsData) {
          const formattedSkills = Array.isArray(skillsData) ?
            skillsData.map(skill => ({
              skill_id: skill.skill_id,
              name: skill.name
            })) : [];

          setAvailableSkills(formattedSkills);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobData.title || !jobData.description || !jobData.category_id || !jobData.type_id || skills.length === 0) {
      setError('Please fill in all required fields and select at least one skill');
      return;
    }

    const salaryValidation = validateSalary();
    if (!salaryValidation.isValid) {
      setError(salaryValidation.message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const requestData = {
        title: jobData.title,
        description: jobData.description,
        category_id: parseInt(jobData.category_id),
        type_id: parseInt(jobData.type_id),
        skills,
        ...(jobData.salary_min && { salary_min: parseInt(jobData.salary_min) }),
        ...(jobData.salary_max && { salary_max: parseInt(jobData.salary_max) }),
        ...(jobData.salary_type && { salary_type: jobData.salary_type }),
      };

      const response = await FetchEndpoint('/job/jobposts', 'POST', token, requestData);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create job post');
      }

      const responseData = await response.json();

      // Reset form
      setJobData({
        title: '',
        description: '',
        category_id: jobCategories.length > 0 ? jobCategories[0].category_id.toString() : '',
        type_id: jobTypes.length > 0 ? jobTypes[0].type_id.toString() : '',
        salary_min: '',
        salary_max: '',
        salary_type: 'monthly',
      });
      setSkills([]);

      navigate("/dashboard");

      alert('Job post created successfully!');
    } catch (err) {
      console.error('Error creating job post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the job post');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '1200px',
      margin: '20px auto',
      p: 3
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Create New Job Post
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Job Title */}
                <Grid item xs={12}>
                  <TextField
                    label="Job Title"
                    name="title"
                    value={jobData.title}
                    onChange={handleUnifiedChange}
                    required
                    fullWidth
                    placeholder="e.g., Frontend Developer"
                  />
                </Grid>

                {/* Job Category */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Job Category</InputLabel>
                    <Select
                      name="category_id"
                      value={jobData.category_id}
                      onChange={handleUnifiedChange}
                      label="Job Category"
                      sx={{
                        padding: '0px 8px',
                      }}
                    >
                      {jobCategories.map(category => (
                        <MenuItem key={category.category_id} value={category.category_id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Job Type */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      name="type_id"
                      value={jobData.type_id}
                      onChange={handleUnifiedChange}
                      label="Job Type"
                    >
                      {jobTypes.map(type => (
                        <MenuItem key={type.type_id} value={type.type_id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Salary Information */}
                <Grid item xs={12}>
                  <Box sx={{
                    border: '1px dashed rgba(25, 118, 210, 0.3)',
                    borderRadius: 2,
                    p: 3,
                    backgroundColor: 'rgba(25, 118, 210, 0.02)',
                    minWidth: '75%',
                    mr: 40,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Salary Information
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={openSalaryDialog}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 3,
                        }}
                      >
                        {(jobData.salary_min || jobData.salary_max) ? 'Edit Salary' : 'Set Salary'}
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={formatSalaryRange()}
                        color={getSalaryChipColor()}
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          borderRadius: 1.5
                        }}
                      />
                      {!(jobData.salary_min || jobData.salary_max) && (
                        <Typography variant="body2" color="text.secondary">
                          Adding salary
                        </Typography>
                      )}
                    </Box>

                    {!validateSalary().isValid && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {validateSalary().message}
                      </Alert>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} gutterBottom sx={{ mt: 2, mr: 40, minWidth: '48.2%' }}>
                  <TextField
                    label="Job Description"
                    name="description"
                    value={jobData.description}
                    onChange={handleUnifiedChange}
                    required
                    multiline
                    rows={5}
                    fullWidth
                    placeholder="Describe the job responsibilities, requirements, and other details..."
                  />
                </Grid>

                <Grid item xs={12} gutterBottom sx={{ mt: 2, mr: 70, minWidth: '48.2%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Required Skills
                  </Typography>

                  {skills.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Selected Skills ({skills.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => handleRemoveSkill(skill)}
                            color="primary"
                            variant="filled"
                            size="small"
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

                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <TextField
                      label="Search or Add Skills"
                      value={skillSearchTerm}
                      onChange={(e) => setSkillSearchTerm(e.target.value)}
                      placeholder="Type to search existing skills or create new ones..."
                      fullWidth
                      size="medium"
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
                              disabled={loading}
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
                          paddingRight: skillSearchTerm.trim() ? 1 : 2
                        }
                      }}
                    />

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

                  {skills.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Please select at least one required skill for this job position. You can search existing skills or create new ones.
                        If you want to create skill please typing like this 'Phyton' where the first letter must be uppercase.
                      </Typography>
                    </Alert>
                  )}

                  {skills.length > 0 && (
                    <Box sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                      borderRadius: 1,
                      border: '1px solid rgba(76, 175, 80, 0.2)'
                    }}>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        ✓ {skills.length} skill{skills.length > 1 ? 's' : ''} selected for this job post
                      </Typography>
                    </Box>
                  )}
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading || !validateSalary().isValid}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      minWidth: '467px'
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Job Post'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={4} gutterBottom sx={{ mt: -83.3, mb: 40, ml: 65, minWidth: '48.2%' }}>
          <PreviewBox elevation={3}>
            <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
              Job Post Preview
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom>
              {jobData.title || 'Job Title'}
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {jobData.category_id && jobCategories.length > 0 && (
                <Chip
                  label={jobCategories.find(cat => cat.category_id.toString() === jobData.category_id.toString())?.name || 'Category'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}

              {jobData.type_id && jobTypes.length > 0 && (
                <Chip
                  label={jobTypes.find(type => type.type_id.toString() === jobData.type_id.toString())?.name || 'Type'}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}

              {(jobData.salary_min || jobData.salary_max) && (
                <Chip
                  icon={<AttachMoneyIcon sx={{ fontSize: '16px !important' }} />}
                  label={formatSalaryRange()}
                  size="small"
                  color={validateSalary().isValid ? "success" : "error"}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Description:
            </Typography>
            <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {jobData.description || 'No description provided yet.'}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              Required Skills:
            </Typography>
            {formatSkillsList()}

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
              {skills.length === 0 || !jobData.title || !jobData.description || !validateSalary().isValid ? (
                <Typography variant="body2" color="error">
                  {!validateSalary().isValid
                    ? 'Please fix salary range to continue'
                    : 'Complete all required fields to finalize your job post.'
                  }
                </Typography>
              ) : (
                <Typography variant="body2" color="success.main">
                  Your job post is ready to be published!
                </Typography>
              )}
            </Box>
          </PreviewBox>
        </Grid>
      </Grid>

      {/* ✅ UPDATED: Enhanced Salary Dialog with Validation */}
      <Dialog
        open={salaryDialogOpen}
        onClose={closeSalaryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
            Set Salary Range
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Salary Type</InputLabel>
                <Select
                  name="salary_type"
                  value={jobData.salary_type}
                  onChange={handleUnifiedChange}
                  label="Salary Type"
                >
                  <MenuItem value="hourly">Per Hour</MenuItem>
                  <MenuItem value="daily">Per Day</MenuItem>
                  <MenuItem value="monthly">Per Month</MenuItem>
                  <MenuItem value="yearly">Per Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Minimum Salary"
                name="salary_min"
                value={jobData.salary_min}
                onChange={handleUnifiedChange}
                fullWidth
                type="number"
                error={!validateSalary().isValid}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                placeholder="0"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Maximum Salary"
                name="salary_max"
                value={jobData.salary_max}
                onChange={handleUnifiedChange}
                fullWidth
                type="number"
                error={!validateSalary().isValid}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                placeholder="0"
              />
            </Grid>

            {/* ✅ NEW: Show validation error in dialog */}
            {!validateSalary().isValid && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {validateSalary().message}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{
                p: 2,
                backgroundColor: validateSalary().isValid ? 'rgba(25, 118, 210, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                borderRadius: 1,
                border: `1px solid ${validateSalary().isValid ? 'rgba(25, 118, 210, 0.2)' : 'rgba(211, 47, 47, 0.2)'}`
              }}>
                <Typography variant="subtitle2" color={validateSalary().isValid ? "primary" : "error"} gutterBottom>
                  Salary Preview:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {validateSalary().isValid ? formatSalaryRange() : validateSalary().message}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeSalaryDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={closeSalaryDialog}
            variant="contained"
            color="primary"
            disabled={!validateSalary().isValid}
          >
            Save Salary
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateJob;