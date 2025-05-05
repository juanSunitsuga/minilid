import { useState } from 'react'
import './App.css'
import { FaHome, FaBriefcase, FaSearch, FaUser, FaBell } from 'react-icons/fa'
import { BsChatDotsFill } from 'react-icons/bs'

function App() {
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
            <a href="#" className="nav-item active">
              <FaHome className="nav-icon" />
              <span className="nav-text">Home</span>
            </a>
            <a href="#" className="nav-item">
              <FaBriefcase className="nav-icon" />
              <span className="nav-text">Jobs</span>
            </a>
            <a href="#" className="nav-item">
              <div className="notification-wrapper">
                <BsChatDotsFill className="nav-icon" />
                {/* <span className="notification-badge">6</span> */}
              </div>
              <span className="nav-text">Messaging</span>
            </a>
            <a href="#" className="nav-item">
              <FaUser className="nav-icon profile-icon" />
              <span className="nav-text">Me</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="content">
        {/* Your main content goes here */}
        <div className="content-placeholder">
          <h1>Welcome to MiniLid</h1>
          <p>Your job search platform</p>
        </div>
      </main>
    </>
  )
}

export default App
