import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, Divider, Alert, Button, Chip, Paper, ClickAwayListener, CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

interface EditJobDialogProps {
  open: boolean;
  onClose: () => void;
  editData: {
    salary_min: string;
    salary_max: string;
    salary_type: string;
    category_id: string;
    type_id: string;
  };
  setEditData: React.Dispatch<React.SetStateAction<any>>;
  categories: { category_id: number; category: string }[];
  jobTypes: { type_id: number; type: string }[];
  validateSalary: () => { isValid: boolean; message: string };
  editSaving: boolean;
  handleEditSubmit: () => void;
  selectedSkills: string[];
  setSelectedSkills: React.Dispatch<React.SetStateAction<string[]>>;
  handleRemoveSkill: (skill: string) => void;
  skillSearchTerm: string;
  setSkillSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  showSuggestions: boolean;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  filteredSkills: { skill_id: number; name: string }[];
  handleSkillSelect: (skill: string) => void;
  handleAddNewSkill: () => void;
}

const EditJobDialog: React.FC<EditJobDialogProps> = ({
  open, onClose, editData, setEditData, categories, jobTypes, validateSalary,
  editSaving, handleEditSubmit, selectedSkills, setSelectedSkills, handleRemoveSkill,
  skillSearchTerm, setSkillSearchTerm, showSuggestions, setShowSuggestions,
  filteredSkills, handleSkillSelect, handleAddNewSkill
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="lg"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 3,
        maxHeight: '90vh'
      }
    }}
  >
    <DialogTitle sx={{ pb: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#0277BD' }}>
        Edit Job Details
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Update salary, category, job type, and skills
      </Typography>
    </DialogTitle>

    <DialogContent sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Salary Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0277BD' }}>
            Salary Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={editData.salary_min}
                onChange={(e) => setEditData((prev: any) => ({ ...prev, salary_min: e.target.value }))}
                error={!validateSalary().isValid}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={editData.salary_max}
                onChange={(e) => setEditData((prev: any) => ({ ...prev, salary_max: e.target.value }))}
                error={!validateSalary().isValid}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Salary Type</InputLabel>
                <Select
                  value={editData.salary_type}
                  label="Salary Type"
                  onChange={(e) => setEditData((prev: any) => ({ ...prev, salary_type: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="hourly">Per Hour</MenuItem>
                  <MenuItem value="daily">Per Day</MenuItem>
                  <MenuItem value="monthly">Per Month</MenuItem>
                  <MenuItem value="yearly">Per Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {!validateSalary().isValid && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {validateSalary().message}
            </Alert>
          )}
        </Box>

        <Divider />

        {/* Category and Type Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0277BD' }}>
            Job Classification
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editData.category_id}
                  label="Category"
                  onChange={(e) => setEditData((prev: any) => ({ ...prev, category_id: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.category_id} value={category.category_id}>
                      {category.category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={editData.type_id}
                  label="Job Type"
                  onChange={(e) => setEditData((prev: any) => ({ ...prev, type_id: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  {jobTypes.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Skills Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0277BD' }}>
            Required Skills
          </Typography>
          {selectedSkills.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected Skills ({selectedSkills.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    color="primary"
                    variant="filled"
                    size="small"
                    deleteIcon={<DeleteIcon />}
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
          <Box sx={{ position: 'relative' }}>
            <TextField
              label="Search or Add Skills"
              value={skillSearchTerm}
              onChange={(e) => setSkillSearchTerm(e.target.value)}
              placeholder="Type to search existing skills or create new ones..."
              fullWidth
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
                      onClick={handleAddNewSkill}
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
                  borderRadius: 2
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
          {selectedSkills.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Please select at least one required skill for this job position.
              </Typography>
            </Alert>
          )}
          {selectedSkills.length > 0 && (
            <Box sx={{
              mt: 2,
              p: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
              borderRadius: 1,
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                ✓ {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
              </Typography>
            </Box>
          )}
        </Box>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Preview:</strong> Your changes will be reflected immediately after saving.
            Leave salary fields empty if you prefer not to display salary information.
          </Typography>
        </Alert>
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 3, gap: 2 }}>
      <Button
        onClick={onClose}
        disabled={editSaving}
        sx={{ borderRadius: 2 }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={handleEditSubmit}
        disabled={
          editSaving ||
          !editData.category_id ||
          !editData.type_id ||
          selectedSkills.length === 0 ||
          !validateSalary().isValid
        }
        sx={{
          borderRadius: 2,
          px: 4,
          py: 1
        }}
        startIcon={editSaving ? <CircularProgress size={20} /> : <EditIcon />}
      >
        {editSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditJobDialog;