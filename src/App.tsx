import { useState, useEffect } from 'react';
import { FaHome, FaBriefcase, FaSearch, FaUser, FaBell } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Import views
import Home from './view/Home';
import Profile from './view/Profile';

// Temporary placeholder components until they're moved to separate files
const Jobs = () => (
  <div className="content-placeholder">
    <h1>Jobs</h1>
    <p>Find your dream job here</p>
  </div>
);

const Chat = () => (
  <div className="content-placeholder">
    <h1>Messages</h1>
    <p>Your conversations</p>
  </div>
);

function App() {
  const location = useLocation();
  const [activePath, setActivePath] = useState('/');
  
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

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
            <Link to="/profile" className={`nav-item ${activePath === '/profile' ? 'active' : ''}`}>
              <FaUser className="nav-icon profile-icon" />
              <span className="nav-text">Me</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </>
  );
}

export default App;