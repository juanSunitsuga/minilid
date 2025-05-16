import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaHome, FaBriefcase, FaSearch, FaUser, FaBell, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Import views
import Home from './view/Home';
import Profile from './view/Profile';
import Job from './view/Job';
import Chat from './view/Chat';
import Login from './view/Login';
import Register from './view/Register';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState('/');
  // Add state to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    setActivePath(location.pathname);
    
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, [location]);

  // Logout function to clear user session
  const handleLogout = () => {
    // Remove all tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    
    // Update login state
    setIsLoggedIn(false);
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <>
      <header className="minilid-header">
        <div className="header-content">
          <div className="logo-search">
            <div className="logo">
              <span className="logo-text">Mini<span className="highlight">Lid</span></span>
            </div>
            
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for anything (Jobs)" 
                className="search-input"
              />
            </div>
          </div>
          <nav className="main-nav">
            <Link to="/" className={`nav-item ${activePath === '/' ? 'active' : ''}`}>
              <FaHome className="nav-icon" />
              <span className="nav-text">Home</span>
            </Link>
            <Link to="/jobs" className={`nav-item ${activePath === '/jobs' ? 'active' : ''}`}>
              <FaBriefcase className="nav-icon" />
              <span className="nav-text">Jobs</span>
            </Link>
            <Link to="/chat" className={`nav-item ${activePath === '/chat' ? 'active' : ''}`}>
              <div className="notification-wrapper">
                <BsChatDotsFill className="nav-icon" />
                {/* <span className="notification-badge">6</span> */}
              </div>
              <span className="nav-text">Chat</span>
            </Link>
            
            {/* Conditional rendering based on authentication status */}
            {isLoggedIn ? (
              <>
                <Link to="/profile" className={`nav-item ${activePath === '/profile' ? 'active' : ''}`}>
                  <FaUser className="nav-icon profile-icon" />
                  <span className="nav-text">Me</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="nav-item logout-button"
                  aria-label="Logout"
                >
                  <FaSignOutAlt className="nav-icon" />
                  <span className="nav-text">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className={`nav-item ${activePath === '/login' ? 'active' : ''}`}>
                <FaSignInAlt className="nav-icon" />
                <span className="nav-text">Login</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Job />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </>
  );
}

export default App;