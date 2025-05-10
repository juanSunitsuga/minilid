import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import { FetchEndpoint } from './FetchEndpoint';
import { Password } from '@mui/icons-material';

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
    <div className="register-container">
      <div className="register-card">
        <h1>Join MiniLid</h1>
        <p className="subtitle">Create your account to get started</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={8}
            />
            <small>Password must be at least 8 characters long</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group user-type-selection">
            <label>I am a:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="applier" // Change from 'applicant' to 'applier'
                  checked={formData.userType === 'applier'} // Also change here
                  onChange={handleInputChange}
                />
                Job Seeker
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="recruiter"
                  checked={formData.userType === 'recruiter'}
                  onChange={handleInputChange}
                />
                Recruiter
              </label>
            </div>
          </div>

          {/* Conditional fields for recruiters */}
          {formData.userType === 'recruiter' && (
            <>
              <div className="form-group">
                <label htmlFor="company">Company Name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">Your Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="e.g. HR Manager, Talent Acquisition"
                />
              </div>
            </>
          )}

          <button type="submit" className="register-button">Create Account</button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;