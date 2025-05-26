import React, { useState, useEffect } from 'react';
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
  FormHelperText,
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled component for preview box
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
  
  // Form data state
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category_id: '',
    type_id: '',
  });

  // Skills and option states
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [jobCategories, setJobCategories] = useState<{ category_id: number, name: string }[]>([]);
  const [availableSkills, setAvailableSkills] = useState<{ skill_id: number, name: string }[]>([]);
  const [jobTypes, setJobTypes] = useState<{ type_id: number, name: string }[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingData, setFetchingData] = useState(true);

  // Function to format skills list for preview
  const formatSkillsList = () => {
    if (skills.length === 0) return <Typography color="text.secondary">No skills selected</Typography>;

    return (
      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
        {skills.map(skill => (
          <li key={skill}>
            <Typography variant="body2">{skill}</Typography>
          </li>
        ))}
      </ul>
    );
  };

  // Fetch categories, types, and skills on component mount
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

        // Fetch job categories
        try {
          console.log("Fetching job categories...");
          const categoriesResponse = await FetchEndpoint('/job/job-categories', 'GET', token);
          if (categoriesResponse.ok) {
            categoriesData = await categoriesResponse.json();
            console.log("Categories data:", categoriesData);
          }
        } catch (err) {
          console.log("Failed to fetch job categories:", err);
        }

        // Fetch job types
        try {
          console.log("Fetching job types...");
          const typesResponse = await FetchEndpoint('/job/job-types', 'GET', token);
          if (typesResponse.ok) {
            typesData = await typesResponse.json();
            console.log("Types data:", typesData);
          }
        } catch (err) {
          console.log("Failed to fetch job types:", err);
        }

        // Fetch skills
        try {
          console.log("Fetching skills...");
          const skillsResponse = await FetchEndpoint('/job/skills', 'GET', token);
          if (skillsResponse.ok) {
            skillsData = await skillsResponse.json();
            console.log("Skills data:", skillsData);
          }
        } catch (err) {
          console.log("Failed to fetch skills:", err);
        }

        // Process categories data if available
        if (categoriesData) {
          const formattedCategories = Array.isArray(categoriesData) ?
            categoriesData.map(cat => ({
              category_id: cat.id || cat.category_id,
              name: cat.name || cat.category_name
            })) : [];

          setJobCategories(formattedCategories);

          // Set default category_id to first item
          if (formattedCategories.length > 0) {
            setJobData(prevData => ({
              ...prevData,
              category_id: formattedCategories[0].category_id.toString()
            }));
          }
        } 

        // Process job types data if available
        if (typesData) {
          const formattedTypes = Array.isArray(typesData) ?
            typesData.map(type => ({
              type_id: type.id || type.type_id,
              name: type.name || type.type_name
            })) : [];

          setJobTypes(formattedTypes);

          // Set default type_id to first item
          if (formattedTypes.length > 0) {
            setJobData(prevData => ({
              ...prevData,
              type_id: formattedTypes[0].type_id.toString()
            }));
          }
        } 

        // Process skills data if available
        if (skillsData) {
          const formattedSkills = Array.isArray(skillsData) ?
            skillsData.map(skill => ({
              skill_id: skill.id || skill.skill_id,
              name: skill.name || skill.skill_name
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

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setJobData({
      ...jobData,
      [name as string]: value
    });
  };

  // Handle skill checkbox changes
  const handleSkillChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.target;

    if (checked) {
      setSkills([...skills, name]);
    } else {
      setSkills(skills.filter(skill => skill !== name));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!jobData.title || !jobData.description || !jobData.category_id || !jobData.type_id || skills.length === 0) {
      setError('Please fill in all required fields and select at least one skill');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Get authentication token
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      // Send job post data to API
      const response = await FetchEndpoint('/job/jobposts', 'POST', token, {
        ...jobData,
        skills
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create job post');
      }

      // Reset form on success
      setJobData({
        title: '',
        description: '',
        category_id: jobCategories.length > 0 ? jobCategories[0].category_id.toString() : '',
        type_id: jobTypes.length > 0 ? jobTypes[0].type_id.toString() : '',
      });
      setSkills([]);

      alert('Job post created successfully!');
    } catch (err) {
      console.error('Error creating job post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the job post');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new skill
  const handleAddNewSkill = async () => {
    // Validate input is not empty
    if (!currentSkill.trim()) return;

    // Check if skill already exists
    const skillExists = availableSkills.some(
      skill => skill.name.toLowerCase() === currentSkill.trim().toLowerCase()
    );

    if (skillExists) {
      alert(`Skill "${currentSkill}" already exists in the list!`);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Send new skill to API
      const response = await FetchEndpoint('/job/skills', 'POST', token, {
        name: currentSkill.trim()
      });

      if (response.ok) {
        const newSkill = await response.json();

        // Format new skill
        const formattedNewSkill = {
          skill_id: newSkill.id || newSkill.skill_id,
          name: newSkill.name
        };

        // Add to available skills
        setAvailableSkills([...availableSkills, formattedNewSkill]);

        // Auto-check the new skill
        setSkills([...skills, formattedNewSkill.name]);

        // Reset input
        setCurrentSkill('');

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
  };

  // Show loading indicator while fetching initial data
  if (fetchingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Main component render
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

      {/* Main Grid Container */}
      <Grid container spacing={4}>
        {/* Form Section */}
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
              <Box sx={{
                p: 2,
                mb: 3,
                backgroundColor: 'error.light',
                borderRadius: 1,
                color: 'error.main'
              }}>
                {error}
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Job Title */}
                <Grid item xs={12}>
                  <TextField
                    label="Job Title"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
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
                      onChange={handleChange}
                      label="Job Category"
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
                      onChange={handleChange}
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

                {/* Job Description */}
                <Grid item xs={12} gutterBottom sx={{ mt: 2, mr: 40, minWidth: '48.2%' }}>
                  <TextField
                    label="Job Description"
                    name="description"
                    value={jobData.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={5}
                    fullWidth
                    placeholder="Describe the job responsibilities, requirements, and other details..."
                  />
                </Grid>

                {/* Required Skills Section */}
                <Grid item xs={12} gutterBottom sx={{ mt: 2, mr: 70, minWidth: '48.2%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Required Skills
                  </Typography>

                  {/* Skills Checkboxes */}
                  <FormGroup>
                    <Grid container spacing={2}>
                      {availableSkills.map((skill) => (
                        <Grid item xs={12} sm={6} md={4} key={skill.skill_id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={skills.includes(skill.name)}
                                onChange={handleSkillChange}
                                name={skill.name}
                              />
                            }
                            label={skill.name}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>

                  {/* Add New Skill */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
                    <TextField
                      label="Add New Skill"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      placeholder="e.g., Django, Flutter, Swift"
                      size="small"
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddNewSkill}
                      disabled={!currentSkill.trim() || loading}
                    >
                      Add Skill
                    </Button>
                  </Box>

                  {/* Skills validation message */}
                  {skills.length === 0 && (
                    <FormHelperText error>
                      Please select at least one required skill for this job position
                    </FormHelperText>
                  )}
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12} sx={{ mt: 2 } }>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
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
        <Grid item xs={12} md={4} gutterBottom sx={{ mt: -90.5, ml: 65, minWidth: '48.2%'  }}>
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
                  label={jobCategories.find(cat => cat.category_id.toString() === jobData.category_id)?.name || 'Category'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}

              {jobData.type_id && jobTypes.length > 0 && (
                <Chip
                  label={jobTypes.find(type => type.type_id.toString() === jobData.type_id)?.name || 'Type'}
                  size="small"
                  color="secondary"
                  variant="outlined"
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
              {skills.length === 0 || !jobData.title || !jobData.description ? (
                <Typography variant="body2" color="error">
                  Complete all required fields to finalize your job post.
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
    </Box>
  );
};

export default CreateJob;