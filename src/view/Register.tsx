import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FetchEndpoint } from './FetchEndpoint';
import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  styled,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Person, 
  Lock, 
  Business, 
  Work 
} from '@mui/icons-material';

// Styled components with enhanced UI
const RegisterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px',
  backgroundColor: '#f5f5f5',
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const RegisterCard = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '16px',
  padding: '40px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
  },
}));

const FormGroup = styled('div')(({ theme }) => ({
  marginBottom: '24px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#007bff',
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#007bff',
        borderWidth: '2px',
      },
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '14px',
  backgroundColor: '#007bff',
  color: 'white',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.2)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'applier', // Change from 'appliers' to 'applier'
    company: '',           // Only for recruiters
    position: '',          // Only for recruiters
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Additional validation for recruiters
    if (formData.userType === 'recruiter' && !formData.company) {
      setError("Company name is required for recruiters");
      return;
    }

    try {
      // Prepare data for API
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        ...(formData.userType === 'recruiter' && {
          company: formData.company,
          position: formData.position || 'Recruiter' // Default position if none provided
        })
      };

      // Call API
      const response = await FetchEndpoint('/auth/register', 'POST', null, { 
        email: formData.email, 
        password: formData.password, 
        name: formData.name,
        userType: formData.userType,
        ...(formData.userType === 'recruiter' && {
          company: formData.company,
          position: formData.position || 'Recruiter'
        })
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('accessToken', data.accessToken);

      // Redirect to home page
      navigate('/');
      // Refresh page to update auth state
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard elevation={0}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: '#1a1a1a',
            textAlign: 'center',
            mb: 3
          }}
        >
          Join MiniLid
        </Typography>
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            color: '#666',
            textAlign: 'center',
            mb: 4
          }}
        >
          Create your account to get started
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            {error}
          </Alert>
        )}

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
              label="Email"
              type="email"
              name="email"
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
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              helperText="Password must be at least 8 characters long"
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
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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

          {formData.userType === 'recruiter' && (
            <>
              <FormGroup>
                <StyledTextField
                  fullWidth
                  label="Company Name"
                  name="company"
                  value={formData.company}
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
                  label="Your Position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="e.g. HR Manager, Talent Acquisition"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work sx={{ color: '#666' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormGroup>
            </>
          )}

          <StyledButton type="submit">
            Create Account
          </StyledButton>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666',
              '& a': {
                color: '#007bff',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.2s ease-in-out',
                '&:hover': {
                  color: '#0056b3',
                },
              },
            }}
          >
            Already have an account?{' '}
            <Link to="/login">
              Sign In
            </Link>
          </Typography>
        </Box>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;