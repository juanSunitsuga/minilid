import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';

interface InterviewScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  interviewDate: Date | null;
  setInterviewDate: (date: Date | null) => void;
  interviewTime: Date | null;
  setInterviewTime: (time: Date | null) => void;
  interviewLocation: string;
  setInterviewLocation: (location: string) => void;
  interviewNotes: string;
  setInterviewNotes: (notes: string) => void;
  interviewError: string | null;
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  open,
  onClose,
  onSubmit,
  interviewDate,
  setInterviewDate,
  interviewTime,
  setInterviewTime,
  interviewLocation,
  setInterviewLocation,
  interviewNotes,
  setInterviewNotes,
  interviewError
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={false}
      disableRestoreFocus
    >
      <DialogTitle>Schedule Interview</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={interviewDate}
              onChange={(newDate) => setInterviewDate(newDate)}
              disablePast
            />
            <TimePicker
              label="Time"
              value={interviewTime}
              onChange={(newTime) => setInterviewTime(newTime)}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel id="interview-location-label">Location</InputLabel>
            <Select
              labelId="interview-location-label"
              value={interviewLocation}
              label="Location"
              onChange={(e: SelectChangeEvent) => setInterviewLocation(e.target.value)}
            >
              <MenuItem value="onsite">On-site</MenuItem>
              <MenuItem value="online">Online (Video Call)</MenuItem>
              <MenuItem value="phone">Phone Interview</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Additional Notes"
            multiline
            rows={3}
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
            fullWidth
          />

          {interviewError && (
            <FormHelperText error>{interviewError}</FormHelperText>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!interviewDate || !interviewTime || !interviewLocation}
        >
          Send Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewScheduleModal;