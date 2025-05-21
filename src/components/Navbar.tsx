import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBriefcase, FaSearch, FaUser, FaBell, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { useModal } from '../view/Context/ModalContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState('/');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Get modal functions from context
  const { openLoginModal, openRegisterModal } = useModal();

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

              {/* Tampilkan Create Job button hanya untuk recruiter */}
              {localStorage.getItem('userType') === 'recruiter' && (
                <Link to="/create-job" className={`nav-item ${activePath === '/create-job' ? 'active' : ''}`}>
                  <FaBriefcase className="nav-icon" />
                  <span className="nav-text">Create Job</span>
                </Link>
              )}

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
            // Changed from Link to button that opens the modal
            <button 
              onClick={() => openLoginModal()}
              className={`nav-item ${activePath === '/login' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <FaSignInAlt className="nav-icon" />
              <span className="nav-text">Login</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;