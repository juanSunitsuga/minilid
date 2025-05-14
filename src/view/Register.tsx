import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Tabs,
  Tab,
  styled
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  Work,
  Language,
  LocationOn
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { FetchEndpoint } from './FetchEndpoint';

const RegisterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
  minHeight: 'calc(100vh - 100px)',
}));

const RegisterCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  padding: theme.spacing(4),
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px',
  borderRadius: theme.shape.borderRadius * 2,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  marginTop: theme.spacing(3),
  fontWeight: 600,
}));

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // User type tabs
  const [userType, setUserType] = useState('individual');

  // Form data state
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Individual applicant fields
    userType: 'applier',

    // Company fields
    companyName: '',
    companyAddress: '',
    companyWebsite: '',
    accountEmail: '',  // Change this from accountUsername to accountEmail
    accountPassword: '',
    confirmAccountPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (event: React.SyntheticEvent, newValue: string) => {
    setUserType(newValue);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (userType === 'individual') {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      try {
        // Prepare data for individual user registration
        const registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        };

        // Call API
        const response = await FetchEndpoint('/auth/register', 'POST', null, registrationData);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        localStorage.setItem('accessToken', data.accessToken);
        navigate('/');
        window.location.reload();
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } else {
      // Company registration validation
      if (!formData.companyName) {
        setError("Company name is required");
        return;
      }

      if (!formData.accountEmail || formData.accountEmail.length < 4) {
        setError("Email must be at least 4 characters");
        return;
      }

      if (formData.accountPassword.length < 8) {
        setError("Account password must be at least 8 characters");
        return;
      }

      if (formData.accountPassword !== formData.confirmAccountPassword) {
        setError("Account passwords don't match");
        return;
      }

      // Format website URL if provided
      let website = formData.companyWebsite;
      if (website && !website.match(/^https?:\/\//)) {
        website = 'https://' + website;
      }

      try {
        // Prepare data for company registration
        const companyRegistrationData = {
          companyName: formData.companyName,
          companyAddress: formData.companyAddress || null,
          companyWebsite: formData.companyWebsite || null,
          companyEmail: formData.accountEmail,
          companyPassword: formData.accountPassword
        };

        console.log('Sending company registration data:', companyRegistrationData);

        // Call company registration API
        const response = await FetchEndpoint('/auth/register-company', 'POST', null, companyRegistrationData);

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          let errorMessage = `Registration failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/');
        window.location.reload();
      } catch (err: any) {
        console.error('Registration error:', err);
        setError(err.message || 'Company registration failed. Please try again.');
      }
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard elevation={0}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Create Your Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Join MiniLid and discover opportunities that match your interests.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={userType}
          onChange={handleUserTypeChange}
          variant="fullWidth"
          sx={{ mb: 4 }}
        >
          <Tab value="individual" label="Job Seeker / Recruiter" />
          <Tab value="company" label="Company Administrator" />
        </Tabs>

        {userType === 'individual' ? (
          <form onSubmit={handleRegister}>
            <FormGroup>
              <StyledTextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                helperText="Password must be at least 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <FormControl
                component="fieldset"
                sx={{
                  '& .MuiFormLabel-root': {
                    color: '#666',
                  },
                  '& .MuiRadio-root': {
                    color: '#007bff',
                  },
                }}
              >
                <FormLabel component="legend">I am a:</FormLabel>
                <RadioGroup
                  row
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                >
                  <FormControlLabel
                    value="applier"
                    control={<Radio />}
                    label="Job Seeker"
                  />
                  <FormControlLabel
                    value="recruiter"
                    control={<Radio />}
                    label="Recruiter"
                  />
                </RadioGroup>
              </FormControl>
            </FormGroup>

            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Create Account
            </StyledButton>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Company Information
            </Typography>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Company Address"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Company Website"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleInputChange}
                helperText="Include http:// or https:// for valid URL format"
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Language sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Administrator Account
            </Typography>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Company Email"
                name="accountEmail"  // Change from accountUsername to accountEmail
                type="email"
                value={formData.accountEmail}  // Change from accountUsername to accountEmail
                onChange={handleInputChange}
                required
                helperText="Enter a valid company email address"
                error={formData.accountEmail.length > 0 && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.accountEmail)}  // Change from accountUsername to accountEmail
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Account Password"
                name="accountPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.accountPassword}
                onChange={handleInputChange}
                required
                helperText="Password must be at least 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <FormGroup>
              <StyledTextField
                fullWidth
                label="Confirm Account Password"
                name="confirmAccountPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmAccountPassword}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormGroup>

            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Register Company
            </StyledButton>
          </form>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;