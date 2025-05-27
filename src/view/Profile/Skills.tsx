import React, { useState } from 'react';
import { 
  Box, Typography, Paper, IconButton, Button, Stack, Avatar
} from '@mui/material';
import { Add as AddIcon, Code as CodeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import SkillsModal from '../Components/SkillsModal';

interface SkillProps {
  skill_id?: number;
  skill_name: string;
  level?: string;
}

interface SkillsProps {
  skills: SkillProps[];
  onUpdateSkills?: (skills: string[]) => Promise<void>;
}

const Skills: React.FC<SkillsProps> = ({ skills = [], onUpdateSkills }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveSkills = async (updatedSkills: string[]) => {
    if (onUpdateSkills) {
      await onUpdateSkills(updatedSkills);
    }
  };

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
          <Typography variant="h5" fontWeight="600">Skills</Typography>
          <IconButton onClick={() => setIsModalOpen(true)}>
            <AddIcon />
          </IconButton>
        </Box>

        {/* Skills list */}
        {skills && skills.length > 0 ? (
          <Stack spacing={2}>
            {skills.map((skill, index) => (
              <Box key={skill.skill_id || index}>
                <Typography variant="body1" fontWeight="500">{skill.skill_name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Box sx={{ 
                    flexGrow: 1, 
                    height: 8, 
                    borderRadius: 4, 
                    bgcolor: 'rgba(0,119,181,0.2)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '75%',
                      bgcolor: 'primary.main',
                      borderRadius: 4
                    }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {skill.level || "Advanced"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            Showcase your skills to stand out to recruiters. Add skills to get endorsed.
          </Typography>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined"
            sx={{ borderRadius: 5, px: 3 }}
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Add skill
          </Button>
        </Box>
      </Paper>

      {/* Skills Modal */}
      {onUpdateSkills && (
        <SkillsModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSkills}
          initialSkills={skills.map(s => s.skill_name)}
        />
      )}
    </motion.div>
  );
};

export default Skills;