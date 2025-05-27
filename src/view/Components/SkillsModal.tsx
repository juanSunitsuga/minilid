import React, { useState, useEffect, KeyboardEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  AlertTitle,
  InputAdornment,
  styled,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const MAX_SKILL_LENGTH = 30;

// Styled components
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(25, 118, 210, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
    '& input': {
      fontFamily: '"Poppins", sans-serif',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Poppins", sans-serif',
    '&.Mui-focused': {
      color: '#1976d2',
    },
  },
  '& .MuiFormHelperText-root': {
    fontFamily: '"Poppins", sans-serif',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: 'white',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  padding: theme.spacing(1.2, 0),
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: '#777',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  padding: theme.spacing(1.2, 0),
  fontSize: '1rem',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: 'rgba(0, 0, 0, 0.5)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(25, 118, 210, 0.1)',
  color: theme.palette.primary.main,
  fontFamily: '"Poppins", sans-serif',
  margin: theme.spacing(0.5),
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
}));

interface SkillsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (skills: string[]) => Promise<void>;
  initialSkills: string[];
}

const SkillsModal: React.FC<SkillsModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialSkills = []
}) => {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('error');

  // Reset skills when the modal opens with new initialSkills
  useEffect(() => {
    if (open) {
      setSkills(initialSkills);
      setNewSkill('');
      setError('');
      setAlertMessage(null);
    }
  }, [initialSkills, open]);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSkill(e.target.value);
    if (error) setError('');
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    
    if (!trimmedSkill) {
      setError('Please enter a skill');
      return;
    }
    
    if (trimmedSkill.length > MAX_SKILL_LENGTH) {
      setError(`Skill name must be ${MAX_SKILL_LENGTH} characters or less`);
      return;
    }
    
    if (skills.includes(trimmedSkill)) {
      setError('This skill is already added');
      return;
    }
    
    setSkills([...skills, trimmedSkill]);
    setNewSkill('');
    setError('');
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills(skills.filter(skill => skill !== skillToDelete));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setAlertMessage(null);
      
      await onSave(skills);
      
      setAlertMessage('Skills updated successfully!');
      setAlertSeverity('success');
      
      // Close modal after success with a small delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating skills:', error);
      setAlertMessage(error.message || 'Failed to update skills. Please try again.');
      setAlertSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSkills(initialSkills);
    setNewSkill('');
    setError('');
    setAlertMessage(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0,0,0,0.2)'
          }
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <IconButton onClick={loading ? undefined : onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            textAlign: 'center', 
            mb: 3,
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Manage Skills
        </Typography>
        
        {alertMessage && (
          <Alert 
            severity={alertSeverity}
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                fontFamily: '"Poppins", sans-serif',
              }
            }}
          >
            <AlertTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
              {alertSeverity === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            {alertMessage}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <StyledTextField
            label="Add a skill"
            fullWidth
            variant="outlined"
            value={newSkill}
            onChange={handleSkillInputChange}
            onKeyDown={handleSkillKeyDown}
            error={!!error}
            helperText={error || `Press Enter to add (max ${MAX_SKILL_LENGTH} chars)`}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="contained" 
            onClick={addSkill}
            sx={{ height: 56 }}
            disabled={loading}
          >
            <AddIcon />
          </Button>
        </Box>
        
        <Box 
          sx={{ 
            p: 2, 
            border: '1px solid rgba(0, 0, 0, 0.1)', 
            borderRadius: 1,
            mb: 3,
            minHeight: 150,
            backgroundColor: 'rgba(0, 0, 0, 0.01)',
            display: 'flex',
            flexWrap: 'wrap',
            overflow: 'auto',
            maxHeight: 250
          }}
        >
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <StyledChip
                key={index}
                label={skill}
                onDelete={loading ? undefined : () => handleDeleteSkill(skill)}
                disabled={loading}
              />
            ))
          ) : (
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              opacity: 0.6
            }}>
              <CodeIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No skills added yet. Add your technical skills to improve your profile visibility.
              </Typography>
            </Box>
          )}
        </Box>
        
        <Stack direction="row" spacing={2}>
          <ActionButton
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? undefined : <SaveIcon />}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </Box>
            ) : (
              'Save Skills'
            )}
          </ActionButton>
          
          <CancelButton
            fullWidth
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
            startIcon={<RefreshIcon />}
          >
            Reset
          </CancelButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsModal;