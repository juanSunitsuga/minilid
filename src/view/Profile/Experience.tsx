import React from 'react';
import { 
  Box, Typography, Paper, IconButton, Button, Avatar
} from '@mui/material';
import { Add as AddIcon, BusinessCenter } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Experience {
  id?: number;
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface ExperienceProps {
  userId?: string;
  userType?: 'applier' | 'recruiter';
  experiences?: Experience[];
  onAddExperience?: () => void;
}

const Experience: React.FC<ExperienceProps> = ({ 
  userId, 
  userType, 
  experiences = [],
  onAddExperience 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight="600">Experience</Typography>
          <IconButton onClick={onAddExperience}>
            <AddIcon />
          </IconButton>
        </Box>

        {experiences && experiences.length > 0 ? (
          experiences.map((exp, index) => (
            <Box key={exp.id || index} sx={{ display: 'flex', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'background.default', mr: 2 }}>
                <BusinessCenter color="action" />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="500">{exp.title} at {exp.company}</Typography>
                <Typography variant="body2" color="text.secondary">{exp.duration}</Typography>
                <Typography variant="body2">{exp.description}</Typography>
              </Box>
            </Box>
          ))
        ) : (
          // Empty state
          <Box sx={{ display: 'flex', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'background.default', mr: 2 }}>
              <BusinessCenter color="action" />
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="500">Add experience</Typography>
              <Typography variant="body2" color="text.secondary">
                Add your work history to showcase your professional journey.
              </Typography>
            </Box>
          </Box>
        )}
        
        <Button 
          variant="outlined"
          sx={{ borderRadius: 5, px: 3 }}
          startIcon={<AddIcon />}
          onClick={onAddExperience}
        >
          Add position
        </Button>
      </Paper>
    </motion.div>
  );
};

export default Experience;