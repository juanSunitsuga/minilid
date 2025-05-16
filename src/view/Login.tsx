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
  Tabs,
  Tab,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px',
  backgroundColor: '#f5f5f5',
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const LoginCard = styled(Paper)(({ theme }) => ({
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

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('applier');
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('individual');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      let data;

      if (loginType === 'individual') {
        // Determine endpoint based on user type
        const endpoint =
          userType === 'applier'
            ? '/auth/login-applier'
            : '/auth/login-recruiter';

        // Call the appropriate user endpoint
        response = await FetchEndpoint(endpoint, 'POST', null, {
          email,
          password,
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userType', userType);
      } else {
        // Company login
        response = await FetchEndpoint('/auth/login-company', 'POST', null, {
          companyEmail: email, // Use companyEmail field for company login
          companyPassword: password, // Use companyPassword field for company login
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Company login failed');
        }

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userType', 'company');
      }

      navigate('/');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <LoginContainer>
      <LoginCard elevation={0}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            textAlign: 'center',
            mb: 3,
          }}
        >
          Welcome to MiniLid
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            color: '#666',
            textAlign: 'center',
            mb: 4,
          }}
        >
          Sign in to access your account
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '8px',
              animation: 'fadeIn 0.3s ease-in-out',
            }}
          >
            {error}
          </Alert>
        )}

        <Tabs
          value={loginType}
          onChange={(e, newValue) => setLoginType(newValue)}
          variant="fullWidth"
          sx={{ mb: 4 }}
        >
          <Tab value="individual" label="Individual User" />
          <Tab value="company" label="Company Administrator" />
        </Tabs>

        {loginType === 'individual' ? (
          <form onSubmit={handleLogin}>
            <FormGroup>
              <StyledTextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
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

            <StyledButton type="submit" variant="contained">
              Sign In
            </StyledButton>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <FormGroup>
              <StyledTextField
                fullWidth
                label="Email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <StyledButton type="submit" variant="contained">
              Sign In
            </StyledButton>
          </form>
        )}

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
            Don't have an account?{' '}
            <Link to="/register">Register</Link>
          </Typography>
        </Box>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;