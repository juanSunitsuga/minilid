import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBriefcase, FaSearch, FaUser, FaBell, FaSignInAlt, FaSignOutAlt, FaChartBar, FaBuilding, FaClipboardList } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { useAuth } from '../Context/AuthContext';
import { useModal } from '../Context/ModalContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState('/');
  const { isAuthenticated, userType, userData, companyData, logout } = useAuth();
  const { openLoginModal, openRegisterModal } = useModal();
  
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  // Get dashboard label and icon based on user type
  const getDashboardInfo = () => {
    switch(userType) {
      case 'applier':
        return {
          label: 'My Applications',
          icon: <FaClipboardList className="nav-icon" />
        };
      case 'recruiter':
        return {
          label: 'Manage Jobs',
          icon: <FaChartBar className="nav-icon" />
        };
      case 'company':
        return {
          label: 'Company',
          icon: <FaBuilding className="nav-icon" />
        };
      default:
        return {
          label: 'Dashboard',
          icon: <FaChartBar className="nav-icon" />
        };
    }
  };

  const dashboardInfo = getDashboardInfo();

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
          
          {/* Only show Chat link when user is authenticated */}
          {isAuthenticated && (
            <Link to="/chat" className={`nav-item ${activePath === '/chat' ? 'active' : ''}`}>
              <div className="notification-wrapper">
                <BsChatDotsFill className="nav-icon" />
              </div>
              <span className="nav-text">Chat</span>
            </Link>
          )}

          {/* Conditional rendering based on authentication status */}
          {isAuthenticated ? (
            <>
              {/* Add Dashboard button with dynamic label based on user type */}
              <button
                onClick={() => navigate('/dashboard')}
                className={`nav-item ${activePath === '/dashboard' ? 'active' : ''}`}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: 0,
                  minWidth: '80px',
                  color: 'rgba(0, 0, 0, 0.6)',
                  height: '52px'
                }}
              >
                {dashboardInfo.icon}
                <span className="nav-text">{dashboardInfo.label}</span>
              </button>

              <Link to="/profile" className={`nav-item ${activePath === '/profile' ? 'active' : ''}`}>
                <FaUser className="nav-icon profile-icon" />
                <span className="nav-text">Me</span>
              </Link>

              <button
                onClick={logout}
                className={`nav-item ${activePath === '/logout' ? 'active' : ''}`}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: 0,
                  minWidth: '80px',
                  color: 'rgba(0, 0, 0, 0.6)',
                  height: '52px'
                }}
                aria-label="Logout"
              >
                <FaSignOutAlt className="nav-icon" />
                <span className="nav-text">Logout</span>
              </button>
            </>
          ) : (
            // Changed from Link to button that opens the modal
            <button 
              onClick={openLoginModal}
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