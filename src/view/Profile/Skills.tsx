import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, IconButton, Button, Stack, Chip,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Code as CodeIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import SkillsModal from '../Components/SkillsModal';
import { FetchEndpoint } from '../FetchEndpoint';

interface SkillProps {
  skill_id: number;
  name: string;
}

interface SkillsProps {
  skills?: SkillProps[];
  readonly?: boolean;
  onUpdateSkills?: () => void;
}

const Skills: React.FC<SkillsProps> = ({ 
  skills = [], 
  readonly = false,
  onUpdateSkills 
}) => {
  const [localSkills, setLocalSkills] = useState<SkillProps[]>(skills);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update local skills when props change
  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  // Fetch user's skills from backend
  const fetchUserSkills = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('Authentication token or user ID not found. Please log in again.');
      }

      console.log('Fetching skills for user:', userId);

      const response = await FetchEndpoint(
        `/profile/appliers-skills?applier_id=${userId}`, 
        'GET', 
        token
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch skills');
      }

      const data = await response.json();
      console.log('Fetched user skills:', data);

      const userSkills = data.data || [];
      setLocalSkills(userSkills);
    } catch (error: any) {
      console.error('Error fetching user skills:', error);
      setError(error.message || 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skills.length === 0 && !readonly) {
      fetchUserSkills();
    }
  }, []);

  // Handle saving new skills
  const handleSaveSkills = async (newSkills: string[]) => {
    if (newSkills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Sending skills to backend:', newSkills);

      const response = await FetchEndpoint(
        '/skills/appliers-skills/create', 
        'POST', 
        token, 
        newSkills
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save skills');
      }

      const data = await response.json();
      console.log('Skills saved successfully:', data);

      // Create temporary skill objects for immediate UI update
      const newSkillObjects = newSkills.map((skillName, index) => ({
        skill_id: Date.now() + index, // Temporary ID
        name: skillName
      }));

      // FIXED: Only add new skills, don't refetch all skills
      if (data.data && Array.isArray(data.data)) {
        // Server returned proper skill objects, use those
        setLocalSkills(prev => [...prev, ...data.data]);
      } else {
        // Server didn't return skill objects, use temporary ones
        setLocalSkills(prev => [...prev, ...newSkillObjects]);
      }
      
      setSuccessMessage(`Successfully added ${newSkills.length} skill(s) to your profile`);
      setIsModalOpen(false);

      // Call parent callback
      if (onUpdateSkills) {
        onUpdateSkills();
      }
    } catch (error: any) {
      console.error('Error saving skills:', error);
      setError(error.message || 'Failed to save skills');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a skill (you'll need to implement this route in backend)
  const handleDeleteSkill = async (skillId: number, skillName: string) => {
    if (!confirm(`Are you sure you want to remove "${skillName}" from your profile?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Make DELETE request
      const response = await FetchEndpoint(
        `/skills/appliers-skills/${skillId}`, 
        'DELETE', 
        token
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete skill');
      }

      // FIXED: Only update local state, don't refetch from server
      setLocalSkills(prev => prev.filter(skill => skill.skill_id !== skillId));
      setSuccessMessage(`Skill "${skillName}" removed successfully`);

      // Call parent callback
      if (onUpdateSkills) {
        onUpdateSkills();
      }
    } catch (error: any) {
      console.error('Error deleting skill:', error);
      setError(error.message || 'Failed to delete skill');
    }
  };

  if (isLoading && localSkills.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, mb: 2.5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading skills...</Typography>
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 2.5,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h5" fontWeight="600">
            Skills {localSkills.length > 0 && `(${localSkills.length})`}
          </Typography>
          {!readonly && (
            <IconButton 
              onClick={() => setIsModalOpen(true)}
              color="primary"
              disabled={isLoading}
            >
              <AddIcon />
            </IconButton>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Skills list */}
        {localSkills && localSkills.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {localSkills.map((skill) => (
              <Chip
                key={skill.skill_id}
                label={skill.name}
                variant="outlined"
                sx={{ 
                  borderRadius: '16px',
                  '& .MuiChip-label': {
                    fontWeight: 500
                  }
                }}
                onDelete={!readonly ? () => handleDeleteSkill(skill.skill_id, skill.name) : undefined}
                deleteIcon={!readonly ? <DeleteIcon /> : undefined}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CodeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary" variant="body1">
              Showcase your skills to stand out to recruiters.
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              Add skills to build your professional profile.
            </Typography>
          </Box>
        )}
        
        {!readonly && (
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="outlined"
              sx={{ borderRadius: 5, px: 3 }}
              startIcon={isLoading ? <CircularProgress size={16} /> : <AddIcon />}
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Add skill'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Skills Modal */}
      {!readonly && (
        <SkillsModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSkills}
          initialSkills={localSkills.map(s => s.name)}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Skills;