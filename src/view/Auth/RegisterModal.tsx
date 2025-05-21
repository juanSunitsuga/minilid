import React, { useState, useEffect } from 'react';
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
  InputAdornment,
  Zoom,
  Fade,
  Slide,
  Grow,
  Collapse,
  CircularProgress,
  IconButton,
  Alert,
  Divider,
  Tabs,
  Tab,
  styled,
  Dialog,
  DialogContent
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
  Language,
  LocationOn,
  Close
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { FetchEndpoint } from '../FetchEndpoint';

// Enhanced styled components with animations
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
  maxWidth: '600px',
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
  marginBottom: theme.spacing(2),
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
  '&.Mui-disabled': {
    backgroundColor: 'rgba(74, 141, 248, 0.4)',
  }
}));

const UserTypeOption = styled(FormControlLabel)(({ theme }) => ({
  borderRadius: '10px',
  padding: '8px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  margin: '0 10px 0 0',
  transition: 'all 0.25s ease',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  boxShadow: 'none',
  flex: 1,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: '32px',
  '& .MuiTab-root': {
    fontSize: '16px',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '12px',
    minHeight: '48px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(74, 141, 248, 0.05)',
    },
  },
  '& .Mui-selected': {
    color: '#4a8df8',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#4a8df8',
    height: '3px',
    borderRadius: '8px 8px 0 0',
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 10,
  color: '#666',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#333',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    transform: 'rotate(90deg)',
  }
}));

// New props interface for the Register component
interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onRegisterSuccess?: () => void;
  onLoginClick?: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  open, 
  onClose, 
  onRegisterSuccess,
  onLoginClick 
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('individual');
  const [isLoading, setIsLoading] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data for both individual and company registration
  const [individualData, setIndividualData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'applier', // 'applier' or 'recruiter'
    company: '',
    position: '',
  });
  
  const [companyData, setCompanyData] = useState({
    companyName: '',
    companyAddress: '',
    companyWebsite: '',
    accountEmail: '',  
    accountPassword: '',
    confirmAccountPassword: '',
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setError('');
      setIsLoading(false);
    }
  }, [open]);

  // Check if individual form is filled enough to enable register button
  useEffect(() => {
    if (userType === 'individual') {
      const isEmailValid = individualData.email.includes('@');
      const isPasswordValid = individualData.password.length >= 8;
      const doPasswordsMatch = individualData.password === individualData.confirmPassword;
      const isNameFilled = individualData.name.trim().length > 0;
      
      const isRecruiterInfoValid = individualData.userType !== 'recruiter' || 
        (individualData.company.trim().length > 0);
      
      setFormFilled(
        isEmailValid && 
        isPasswordValid && 
        doPasswordsMatch && 
        isNameFilled && 
        isRecruiterInfoValid
      );
    } else {
      // Company form validation
      const isCompanyNameFilled = companyData.companyName.trim().length > 0;
      const isEmailValid = companyData.accountEmail.includes('@');
      const isPasswordValid = companyData.accountPassword.length >= 8;
      const doPasswordsMatch = companyData.accountPassword === companyData.confirmAccountPassword;
      
      setFormFilled(
        isCompanyNameFilled &&
        isEmailValid && 
        isPasswordValid && 
        doPasswordsMatch
      );
    }
  }, [individualData, companyData, userType]);

  const handleIndividualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIndividualData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserTypeTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setUserType(newValue);
    setError('');
  };

  // Modified handleIndividualRegister function to work with modal
  const handleIndividualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (individualData.password !== individualData.confirmPassword) {
        setError("Passwords don't match");
        setIsLoading(false);
        return;
      }

      if (individualData.password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      // Create the registration data object
      const registrationData = {
        name: individualData.name,
        email: individualData.email,
        password: individualData.password,
        userType: individualData.userType
      };

      // Choose the right endpoint based on user type
      const endpoint = individualData.userType === 'applier' 
        ? '/auth/register-applier' 
        : '/auth/register-recruiter';
      
      // Log the request for debugging
      console.log(`Registering ${individualData.userType} with endpoint ${endpoint}`, registrationData);

      // Make the API call
      const response = await FetchEndpoint(endpoint, 'POST', null, registrationData);
      
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 
          (errorData.errors && errorData.errors.join(', ')) || 
          'Registration failed'
        );
      }
      
      // Parse the response data - handle both direct and wrapped formats
      const responseData = await response.json();
      const data = responseData.data || responseData;

      // Store auth token and user type
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userType', individualData.userType);
      
      if (data.user) {
        localStorage.setItem('userId', data.user.user_id);
        localStorage.setItem('userName', data.user.name);
      }

      // Success animation before closing modal
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Close the modal
      onClose();
      
      // Call success callback if provided
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Modified handleCompanyRegister function
  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!companyData.companyName) {
        setError("Company name is required");
        setIsLoading(false);
        return;
      }

      if (!companyData.accountEmail || !companyData.accountEmail.includes('@')) {
        setError("Valid email address is required");
        setIsLoading(false);
        return;
      }

      if (companyData.accountPassword.length < 8) {
        setError("Account password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      if (companyData.accountPassword !== companyData.confirmAccountPassword) {
        setError("Account passwords don't match");
        setIsLoading(false);
        return;
      }

      // Format website URL if provided
      let website = companyData.companyWebsite;
      if (website && !website.match(/^https?:\/\//)) {
        website = 'https://' + website;
      }
      
      // Prepare data for company registration
      const companyRegistrationData = {
        companyName: companyData.companyName,
        companyEmail: companyData.accountEmail,
        companyPassword: companyData.accountPassword,
        companyAddress: companyData.companyAddress || null,
        companyWebsite: website || null,
      };

      console.log('Sending company registration data:', companyRegistrationData);

      // Call company registration API
      const response = await FetchEndpoint('/auth/register-company', 'POST', null, companyRegistrationData);
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.data?.message || 
          errorData.message || 
          `Registration failed with status ${response.status}`
        );
      }

      // Parse the response data - handle both direct and wrapped formats
      const responseData = await response.json();
      const data = responseData.data || responseData;

      // Store auth token and user type
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userType', 'company');
      
      if (data.company) {
        localStorage.setItem('companyId', data.company.id);
        localStorage.setItem('companyName', data.company.name);
      }

      // Success animation before closing modal
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Close the modal
      onClose();
      
      // Call success callback if provided
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err: any) {
      console.error('Company registration error:', err);
      setError(err.message || 'Company registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      // Remove fullWidth to have more control
      maxWidth="sm"
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          // Set specific width to match login modal
          width: '500px',
          margin: '0 auto'
        }
      }}
    >
      <DialogContent 
        sx={{ 
          p: 0,
          overflow: 'auto',
          backgroundColor: 'transparent',
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '24px',
          position: 'relative',
          maxHeight: 'calc(100vh - 64px)',
          // Hide scrollbar but keep functionality
          '&::-webkit-scrollbar': {
            display: 'none', // Safari and Chrome
          },
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        {/* Decorative bubbles - make slightly smaller */}
        <FloatingBubble size={50} top={15} left={20} delay={0} />
        <FloatingBubble size={35} top={70} left={80} delay={1} />
        <FloatingBubble size={65} top={30} left={85} delay={0.5} />
        <FloatingBubble size={25} top={80} left={10} delay={1.5} />
        <FloatingBubble size={40} top={50} left={50} delay={2} />
        
        <Fade in={true} timeout={1000}>
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <RegisterCard elevation={4} sx={{
              padding: '30px', // Reduce padding from 40px to 30px
              maxWidth: '500px', // Set consistent max-width
              '&:hover': {
                transform: 'translateY(-5px)', // Reduce hover lift from 8px to 5px
              }
            }}>
              <CloseButton onClick={onClose}>
                <Close fontSize="small" />
              </CloseButton>
              
              <Slide direction="down" in={true} timeout={800}>
                <Box>
                  <ShiningTitle 
                    variant="h4" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                      mb: 1,
                      fontSize: '26px' // Reduce font size
                    }}
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
                    mb: 3, // Reduce from 4 to 3
                    fontWeight: 500,
                    fontSize: '14px' // Reduce font size
                  }}
                >
                  Create your account to get started
                </Typography>
              </Fade>

              <Collapse in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2, // Reduce from 3 to 2
                    borderRadius: '8px', // Reduce from 12px to 8px
                    fontSize: '14px', // Add smaller font size
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
              
              <StyledTabs
                value={userType}
                onChange={handleUserTypeTabChange}
                variant="fullWidth"
                sx={{ mb: 3 }} // Reduce from 4 to 3
              >
                <Tab 
                  value="individual" 
                  label="Job Seeker / Recruiter" 
                  sx={{ fontSize: '14px' }} 
                />
                <Tab 
                  value="company" 
                  label="Company Administrator" 
                  sx={{ fontSize: '14px' }} 
                />
              </StyledTabs>

              {userType === 'individual' ? (
                <form onSubmit={handleIndividualRegister}>
                  <FormGroup sx={{ mb: '20px' }}>
                    <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
                      <FormGroup>
                        <StyledTextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={individualData.name}
                          onChange={handleIndividualInputChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person 
                                  sx={{ 
                                    color: individualData.name ? '#4a8df8' : '#888',
                                    transition: 'color 0.3s ease, transform 0.3s ease',
                                    transform: individualData.name ? 'scale(1.1)' : 'scale(1)'
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
                          value={individualData.email}
                          onChange={handleIndividualInputChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email 
                                  sx={{ 
                                    color: individualData.email ? '#4a8df8' : '#888',
                                    transition: 'color 0.3s ease, transform 0.3s ease',
                                    transform: individualData.email ? 'scale(1.1)' : 'scale(1)'
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
                          value={individualData.password}
                          onChange={handleIndividualInputChange}
                          required
                          helperText="Password must be at least 8 characters long"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock 
                                  sx={{ 
                                    color: individualData.password ? '#4a8df8' : '#888',
                                    transition: 'color 0.3s ease, transform 0.3s ease',
                                    transform: individualData.password ? 'scale(1.1)' : 'scale(1)'
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
                          value={individualData.confirmPassword}
                          onChange={handleIndividualInputChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock 
                                  sx={{ 
                                    color: individualData.confirmPassword ? '#4a8df8' : '#888',
                                    transition: 'color 0.3s ease, transform 0.3s ease',
                                    transform: individualData.confirmPassword ? 'scale(1.1)' : 'scale(1)'
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
                            width: '100%',
                          }}
                        >
                          <FormLabel component="legend">I am a:</FormLabel>
                          <RadioGroup
                            row
                            name="userType"
                            value={individualData.userType}
                            onChange={handleIndividualInputChange}
                            sx={{
                              display: 'flex',
                              gap: '10px',
                              width: '100%',
                              marginTop: '8px',
                            }}
                          >
                            <FormControlLabel
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
                              label={<Typography sx={{ fontWeight: 500 }}>Job Seeker</Typography>}
                              sx={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                margin: 0,
                                flex: 1,
                                border: individualData.userType === 'applier' 
                                  ? '1px solid rgba(74, 141, 248, 0.5)' 
                                  : '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: individualData.userType === 'applier'
                                  ? '0 4px 12px rgba(74, 141, 248, 0.15)'
                                  : 'none',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            />
                            <FormControlLabel
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
                              label={<Typography sx={{ fontWeight: 500 }}>Recruiter</Typography>}
                              sx={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                margin: 0,
                                flex: 1,
                                border: individualData.userType === 'recruiter' 
                                  ? '1px solid rgba(74, 141, 248, 0.5)' 
                                  : '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: individualData.userType === 'recruiter'
                                  ? '0 4px 12px rgba(74, 141, 248, 0.15)'
                                  : 'none',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            />
                          </RadioGroup>
                        </FormControl>
                      </FormGroup>
                    </Fade>

                    {individualData.userType === 'recruiter' && (
                      <Box>
                        <Fade in={true} timeout={500}>
                          <Box>
                            <FormGroup>
                              <StyledTextField
                                fullWidth
                                label="Company Name"
                                name="company"
                                value={individualData.company}
                                onChange={handleIndividualInputChange}
                                required
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Business 
                                        sx={{ 
                                          color: individualData.company ? '#4a8df8' : '#888',
                                          transition: 'color 0.3s ease, transform 0.3s ease',
                                          transform: individualData.company ? 'scale(1.1)' : 'scale(1)'
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
                                value={individualData.position}
                                onChange={handleIndividualInputChange}
                                placeholder="e.g. HR Manager, Talent Acquisition"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Work 
                                        sx={{ 
                                          color: individualData.position ? '#4a8df8' : '#888',
                                          transition: 'color 0.3s ease, transform 0.3s ease',
                                          transform: individualData.position ? 'scale(1.1)' : 'scale(1)'
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
                            `Create ${individualData.userType === 'applier' ? 'Job Seeker' : 'Recruiter'} Account`
                          )}
                        </StyledButton>
                      </Box>
                    </Grow>
                  </FormGroup>
                </form>
              ) : (
                <form onSubmit={handleCompanyRegister}>
                  <Typography 
                    variant="h6" 
                    fontWeight="600" 
                    sx={{ 
                      mb: 1.5, // Reduce from 2 to 1.5
                      fontSize: '18px' // Add smaller font size
                    }}
                  >
                    Company Information
                  </Typography>
                  
                  <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
                    <FormGroup>
                      <StyledTextField
                        fullWidth
                        label="Company Name"
                        name="companyName"
                        value={companyData.companyName}
                        onChange={handleCompanyInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business 
                                sx={{ 
                                  color: companyData.companyName ? '#4a8df8' : '#888',
                                  transition: 'color 0.3s ease, transform 0.3s ease',
                                  transform: companyData.companyName ? 'scale(1.1)' : 'scale(1)'
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
                        label="Company Address"
                        name="companyAddress"
                        value={companyData.companyAddress}
                        onChange={handleCompanyInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn 
                                sx={{ 
                                  color: companyData.companyAddress ? '#4a8df8' : '#888',
                                  transition: 'color 0.3s ease, transform 0.3s ease',
                                  transform: companyData.companyAddress ? 'scale(1.1)' : 'scale(1)'
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
                        label="Company Website"
                        name="companyWebsite"
                        value={companyData.companyWebsite}
                        onChange={handleCompanyInputChange}
                        helperText="Include http:// or https:// for valid URL format"
                        placeholder="https://example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Language 
                                sx={{ 
                                  color: companyData.companyWebsite ? '#4a8df8' : '#888',
                                  transition: 'color 0.3s ease, transform 0.3s ease',
                                  transform: companyData.companyWebsite ? 'scale(1.1)' : 'scale(1)'
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormGroup>
                  </Fade>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                    Administrator Account
                  </Typography>

                  <Fade in={true} timeout={800} style={{ transitionDelay: '700ms' }}>
                    <FormGroup>
                      <StyledTextField
                        fullWidth
                        label="Company Email"
                        type="email"
                        name="accountEmail"
                        value={companyData.accountEmail}
                        onChange={handleCompanyInputChange}
                        required
                        helperText="Enter a valid company email address"
                        error={companyData.accountEmail.length > 0 && !companyData.accountEmail.includes('@')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email 
                                sx={{ 
                                  color: companyData.accountEmail ? '#4a8df8' : '#888',
                                  transition: 'color 0.3s ease, transform 0.3s ease',
                                  transform: companyData.accountEmail ? 'scale(1.1)' : 'scale(1)'
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormGroup>
                  </Fade>

                  <Fade in={true} timeout={800} style={{ transitionDelay: '800ms' }}>
                    <FormGroup>
                      <StyledTextField
                        fullWidth
                        label="Account Password"
                        type={showPassword ? 'text' : 'password'}
                        name="accountPassword"
                        value={companyData.accountPassword}
                        onChange={handleCompanyInputChange}
                        required
                        helperText="Password must be at least 8 characters"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock 
                                sx={{ 
                                  color: companyData.accountPassword ? '#4a8df8' : '#888',
                                  transition: 'color 0.3s ease, transform 0.3s ease',
                                  transform: companyData.accountPassword ? 'scale(1.1)' : 'scale(1)'
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

                  <Fade in={true} timeout={800} style={{ transitionDelay: '900ms' }}>
                    <FormGroup>
                      <StyledTextField
                        fullWidth
                        label="Confirm Account Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmAccountPassword"
                        value={companyData.confirmAccountPassword}
                        onChange={handleCompanyInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock 
                                sx={{ 
                                  color: companyData.confirmAccountPassword ? '#4a8df8' : '#888',
                                  transition: 'color 0.3s ease, transform 0.3s ease',
                                  transform: companyData.confirmAccountPassword ? 'scale(1.1)' : 'scale(1)'
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
                          "Register Company"
                        )}
                      </StyledButton>
                    </Box>
                  </Grow>
                </form>
              )}
              
              <Fade in={true} timeout={1200} style={{ transitionDelay: '1200ms' }}>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontSize: '13px' // Add smaller font size
                    }}
                  >
                    Already have an account?{' '}
                    <Box 
                      component="span" 
                      sx={{ 
                        color: '#4a8df8',
                        textDecoration: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
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
                      }}
                      onClick={() => {
                        onClose();
                        if (onLoginClick) onLoginClick();
                      }}
                    >
                      Sign In
                    </Box>
                  </Typography>
                </Box>
              </Fade>
            </RegisterCard>
          </Zoom>
        </Fade>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;