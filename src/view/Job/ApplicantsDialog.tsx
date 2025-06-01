
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';

interface Applicant {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface ApplicantsDialogProps {
  open: boolean;
  applicants: Applicant[];
  loading: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const ApplicantsDialog: React.FC<ApplicantsDialogProps> = ({
  open,
  applicants,
  loading,
  onClose,
  onRefresh,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Job Applicants</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress size={50} />
          </Box>
        ) : applicants.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No applicants available.
          </Typography>
        ) : (
          <List>
            {applicants.map((applicant) => (
              <ListItem key={applicant.id}>
                <ListItemText
                  primary={applicant.name}
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {applicant.email} - Status: {applicant.status}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onRefresh}>
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicantsDialog;