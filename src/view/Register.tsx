import React, { useState, useEffect } from 'react';
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
  Zoom,
  Fade,
  Slide,
  Grow,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Person, 
  Lock, 
  Business, 
  Work,
  LightbulbOutlined,
} from '@mui/icons-material';

// Enhanced styled components with animations
const RegisterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '90vh',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden',
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 90%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)',
    zIndex: 0,
  },
}));

const FloatingBubble = styled('div')(({ size, top, left, delay }: { size: number, top: number, left: number, delay: number }) => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
  top: `${top}%`,
  left: `${left}%`,
  animation: `float 15s ease-in-out ${delay}s infinite`,
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px) scale(1)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'translateY(-20px) scale(1.05)',
      opacity: 0.9,
    }
  },
  zIndex: 0,
}));

const RegisterCard = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  padding: '40px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.07)',
  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.08)',
  },
}));

const FormGroup = styled('div')(({ theme }) => ({
  marginBottom: '28px',
  position: 'relative',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.25s ease-in-out',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(5px)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4a8df8',
      },
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4a8df8',
        borderWidth: '2px',
        boxShadow: '0 0 0 4px rgba(74, 141, 248, 0.1)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '16px',
    '&.Mui-focused': {
      color: '#4a8df8',
    },
  },
  '& .MuiInputAdornment-root': {
    '& .MuiSvgIcon-root': {
      transition: 'all 0.3s ease',
    },
    '&:hover .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    }
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '14px',
  backgroundColor: '#4a8df8',
  color: 'white',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'all 0.6s ease',
  },
  '&:hover': {
    backgroundColor: '#3a7ce8',
    transform: 'translateY(-4px) scale(1.01)',
    boxShadow: '0 6px 20px rgba(74, 141, 248, 0.4)',
    '&::before': {
      left: '100%',
    }
  },
  '&:active': {
    transform: 'translateY(0) scale(0.99)',
    boxShadow: '0 2px 10px rgba(74, 141, 248, 0.3)',
  },
}));

const UserTypeOption = styled(FormControlLabel)(({ value, selected }: { value: string, selected: boolean }) => ({
  borderRadius: '12px',
  padding: '8px 16px',
  backgroundColor: selected ? 'rgba(74, 141, 248, 0.1)' : 'rgba(255, 255, 255, 0.6)',
  margin: '0 10px 0 0',
  transition: 'all 0.25s ease',
  border: selected ? '1px solid rgba(74, 141, 248, 0.5)' : '1px solid rgba(0, 0, 0, 0.1)',
  boxShadow: selected ? '0 4px 12px rgba(74, 141, 248, 0.15)' : 'none',
  '&:hover': {
    backgroundColor: selected ? 'rgba(74, 141, 248, 0.15)' : 'rgba(255, 255, 255, 0.8)',
    transform: 'translateY(-2px)',
  },
}));

const ShiningTitle = styled(Typography)(() => ({
  fontWeight: 800,
  backgroundImage: 'linear-gradient(45deg, #4a8df8, #63a4ff)',
  backgroundSize: '100%',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
    transform: 'translateX(-100%)',
    animation: 'shine 3s infinite',
  },
  '@keyframes shine': {
    '0%': { transform: 'translateX(-100%)' },
    '20%, 100%': { transform: 'translateX(100%)' },
  },
}));

const Tip = styled(Box)(({ theme }) => ({
  marginTop: '28px',
  padding: '12px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '12px',
  border: '1px solid rgba(74, 141, 248, 0.3)',
  position: 'relative',
  transition: 'all 0.25s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.05)',
  }
}));

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'applier',
    company: '',
    position: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Random tip messages
  const tips = [
    "Add a professional photo to complete your profile after registration",
    "Recruiters are 40% more likely to view profiles with a complete work history",
    "Keep your skills section updated with the latest industry keywords",
    "A detailed bio increases your chances of getting noticed"
  ];
  
  const [currentTip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  // Check if form is filled enough to enable register button
  useEffect(() => {
    const isEmailValid = formData.email.includes('@');
    const isPasswordValid = formData.password.length >= 8;
    const doPasswordsMatch = formData.password === formData.confirmPassword;
    const isNameFilled = formData.name.trim().length > 0;
    
    const isRecruiterInfoValid = formData.userType !== 'recruiter' || 
      (formData.company.trim().length > 0);
    
    setFormFilled(
      isEmailValid && 
      isPasswordValid && 
      doPasswordsMatch && 
      isNameFilled && 
      isRecruiterInfoValid
    );
  }, [formData]);

  // Show tip after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

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
    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    // Additional validation for recruiters
    if (formData.userType === 'recruiter' && !formData.company) {
      setError("Company name is required for recruiters");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate network delay (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      const response = await FetchEndpoint('/auth/register', 'POST', null, registrationData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userType', formData.userType);

      // Success animation before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to home page
      navigate('/');
      // Refresh page to update auth state
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      {/* Decorative bubbles */}
      <FloatingBubble size={60} top={15} left={20} delay={0} />
      <FloatingBubble size={40} top={70} left={80} delay={1} />
      <FloatingBubble size={80} top={30} left={85} delay={0.5} />
      <FloatingBubble size={30} top={80} left={10} delay={1.5} />
      <FloatingBubble size={50} top={50} left={50} delay={2} />
      
      <Fade in={true} timeout={1000}>
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <RegisterCard elevation={4}>
            <Slide direction="down" in={true} timeout={800}>
              <Box>
                <ShiningTitle 
                  variant="h4" 
                  gutterBottom 
                  align="center"
                  sx={{ mb: 1 }}
                >
                  Join MiniLid
                </ShiningTitle>
              </Box>
            </Slide>
            
            <Fade in={true} timeout={1200}>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  color: '#555',
                  textAlign: 'center',
                  mb: 4,
                  fontWeight: 500
                }}
              >
                Create your account to get started
              </Typography>
            </Fade>

            <Collapse in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  animation: 'shake 0.5s ease-in-out',
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                  }
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Collapse>

            <form onSubmit={handleRegister}>
              <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
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
                          <Person 
                            sx={{ 
                              color: formData.name ? '#4a8df8' : '#888',
                              transition: 'color 0.3s ease, transform 0.3s ease',
                              transform: formData.name ? 'scale(1.1)' : 'scale(1)'
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormGroup>
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: '500ms' }}>
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
                          <Email 
                            sx={{ 
                              color: formData.email ? '#4a8df8' : '#888',
                              transition: 'color 0.3s ease, transform 0.3s ease',
                              transform: formData.email ? 'scale(1.1)' : 'scale(1)'
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormGroup>
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: '600ms' }}>
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
                          <Lock 
                            sx={{ 
                              color: formData.password ? '#4a8df8' : '#888',
                              transition: 'color 0.3s ease, transform 0.3s ease',
                              transform: formData.password ? 'scale(1.1)' : 'scale(1)'
                            }} 
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(74, 141, 248, 0.1)',
                              }
                            }}
                          >
                            {showPassword ? 
                              <VisibilityOff sx={{ color: '#4a8df8' }} /> : 
                              <Visibility sx={{ color: '#888' }} />
                            }
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormGroup>
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: '700ms' }}>
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
                          <Lock 
                            sx={{ 
                              color: formData.confirmPassword ? '#4a8df8' : '#888',
                              transition: 'color 0.3s ease, transform 0.3s ease',
                              transform: formData.confirmPassword ? 'scale(1.1)' : 'scale(1)'
                            }} 
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(74, 141, 248, 0.1)',
                              }
                            }}
                          >
                            {showConfirmPassword ? 
                              <VisibilityOff sx={{ color: '#4a8df8' }} /> : 
                              <Visibility sx={{ color: '#888' }} />
                            }
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormGroup>
              </Fade>

              <Fade in={true} timeout={800} style={{ transitionDelay: '800ms' }}>
                <FormGroup>
                  <FormControl 
                    component="fieldset"
                    sx={{
                      '& .MuiFormLabel-root': {
                        color: '#555',
                        fontWeight: 500,
                        marginBottom: '8px',
                      },
                    }}
                  >
                    <FormLabel component="legend">I am a:</FormLabel>
                    <RadioGroup
                      row
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginTop: '8px',
                      }}
                    >
                      <UserTypeOption
                        value="applier"
                        control={
                          <Radio 
                            sx={{ 
                              color: '#4a8df8',
                              '&.Mui-checked': {
                                color: '#4a8df8',
                              }
                            }} 
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: formData.userType === 'applier' ? 600 : 400 }}>
                            Job Seeker
                          </Typography>
                        }
                        selected={formData.userType === 'applier'}
                      />
                      <UserTypeOption
                        value="recruiter"
                        control={
                          <Radio 
                            sx={{ 
                              color: '#4a8df8',
                              '&.Mui-checked': {
                                color: '#4a8df8',
                              }
                            }} 
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: formData.userType === 'recruiter' ? 600 : 400 }}>
                            Recruiter
                          </Typography>
                        }
                        selected={formData.userType === 'recruiter'}
                      />
                    </RadioGroup>
                  </FormControl>
                </FormGroup>
              </Fade>

              {formData.userType === 'recruiter' && (
                <Box>
                  <Fade in={true} timeout={500}>
                    <Box>
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
                                <Business 
                                  sx={{ 
                                    color: formData.company ? '#4a8df8' : '#888',
                                    transition: 'color 0.3s ease, transform 0.3s ease',
                                    transform: formData.company ? 'scale(1.1)' : 'scale(1)'
                                  }} 
                                />
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
                                <Work 
                                  sx={{ 
                                    color: formData.position ? '#4a8df8' : '#888',
                                    transition: 'color 0.3s ease, transform 0.3s ease',
                                    transform: formData.position ? 'scale(1.1)' : 'scale(1)'
                                  }} 
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </FormGroup>
                    </Box>
                  </Fade>
                </Box>
              )}

              <Grow in={true} timeout={1000} style={{ transitionDelay: '1000ms' }}>
                <Box>
                  <StyledButton 
                    type="submit"
                    disabled={isLoading || !formFilled}
                    sx={{
                      opacity: formFilled ? 1 : 0.7,
                      position: 'relative',
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      `Create ${formData.userType === 'applier' ? 'Job Seeker' : 'Recruiter'} Account`
                    )}
                  </StyledButton>
                </Box>
              </Grow>
            </form>

            <Fade in={true} timeout={1200} style={{ transitionDelay: '1200ms' }}>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    '& a': {
                      color: '#4a8df8',
                      textDecoration: 'none',
                      fontWeight: 600,
                      position: 'relative',
                      padding: '2px 4px',
                      transition: 'all 0.3s ease',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '0%',
                        height: '2px',
                        backgroundColor: '#4a8df8',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        color: '#3a7ce8',
                        '&::after': {
                          width: '100%',
                        },
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
            </Fade>
          </RegisterCard>
        </Zoom>
      </Fade>
    </RegisterContainer>
  );
};

export default Register;