import React, { useState } from 'react';
import { 
  Box, Typography, Paper, IconButton, TextField, Button
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';


interface AboutProps {
  about: string | null;
  onSave: (text: string) => Promise<void>;
}

const About: React.FC<AboutProps> = ({ about, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [aboutText, setAboutText] = useState(about || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(aboutText);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving about section:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
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
          <Typography variant="h5" fontWeight="600">About</Typography>
          {!isEditing && (
            <IconButton onClick={() => setIsEditing(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
        
        {isEditing ? (
          <Box>
            <TextField
              multiline
              fullWidth
              rows={4}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Write something about yourself..."
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setIsEditing(false);
                  setAboutText(about || '');
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {about || "Add a summary about yourself"}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
};

export default About;