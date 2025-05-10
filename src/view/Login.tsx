import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FetchEndpoint } from './FetchEndpoint';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('applier'); // Default to applier
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Include userType in the request
            const response = await FetchEndpoint('/auth/login', 'POST', null, { 
                email, 
                password,
                userType 
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userType', userType); // Store user type for future use

            // Redirect to home page
            navigate('/');
            // Refresh page to update auth state
            window.location.reload();

        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Welcome to MiniLid</h1>
                <p className="subtitle">Sign in to access your account</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>I am a:</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="applier"
                                    checked={userType === 'applier'}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                Job Seeker
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="recruiter"
                                    checked={userType === 'recruiter'}
                                    onChange={(e) => setUserType(e.target.value)}
                                />
                                Recruiter
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="login-button">Sign In</button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;