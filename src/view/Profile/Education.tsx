import React from 'react';
import { 
  Box, Typography, Paper, IconButton, Button, Avatar
} from '@mui/material';
import { Add as AddIcon, School } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface EducationItem {
  id?: number;
  institution: string;
  degree: string;
  year: string;
}

interface EducationProps {
  education?: EducationItem[];
  onAddEducation?: () => void;
}

const Education: React.FC<EducationProps> = ({ 
  education = [
    {
      institution: 'Institut Teknologi Harapan Bangsa',
      degree: 'Bachelor of Computer Science',
      year: '2021 - 2025'
    }
  ],
  onAddEducation
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
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
          <Typography variant="h5" fontWeight="600">Education</Typography>
          <IconButton onClick={onAddEducation}>
            <AddIcon />
          </IconButton>
        </Box>

        {education.map((edu, index) => (
          <Box key={index} sx={{ display: 'flex', mb: 3 }}>
            <Avatar sx={{ mr: 2 }} variant="rounded">
              <School />
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="500">{edu.institution}</Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.degree}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {edu.year}
              </Typography>
            </Box>
          </Box>
        ))}
        
        <Button 
          variant="outlined"
          sx={{ borderRadius: 5, px: 3 }}
          startIcon={<AddIcon />}
          onClick={onAddEducation}
        >
          Add education
        </Button>
      </Paper>
    </motion.div>
  );
};

export default Education;