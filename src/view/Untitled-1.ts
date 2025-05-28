// 1. Create a separate Interview Dialog component
const InterviewDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = {} 
}) => {
  // Local state that won't be affected by parent rerenders
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState(initialData.location || '');
  const [notes, setNotes] = useState(initialData.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Only initialize values when dialog first opens
  useEffect(() => {
    if (open) {
      // Set initial values when dialog opens
      if (initialData.date) {
        setDate(parseISO(initialData.date));
        setTime(parseISO(initialData.date));
      }
      setLocation(initialData.location || '');
      setNotes(initialData.notes || '');
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const dateTime = new Date(date);
      dateTime.setHours(time.getHours(), time.getMinutes());
      
      await onSubmit({
        date: dateTime,
        location,
        notes
      });
      
      // Close dialog on success
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // This prevents the dialog from closing on backdrop click when submitting
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle>Schedule Interview</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <DatePicker
                label="Date"
                value={date}
                onChange={(newDate) => newDate && setDate(newDate)}
                disablePast
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
              <TimePicker
                label="Time"
                value={time}
                onChange={(newTime) => newTime && setTime(newTime)}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </Box>
          </LocalizationProvider>
          
          <TextField
            fullWidth
            margin="normal"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Office address or video call link"
            required
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Additional Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details for the candidate"
            multiline
            rows={3}
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !location}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};