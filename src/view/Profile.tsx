import React from 'react';
import './Profile.css';
import { FaPen, FaPlus, FaCamera, FaLinkedin, FaTwitter, FaGlobe, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaUserPlus } from 'react-icons/fa';

const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      {/* Background and profile section */}
      <div className="profile-top">
        <div className="cover-photo">
          <button className="edit-cover-btn">
            <FaCamera />
          </button>
        </div>
        
        <div className="profile-header">
          <div className="profile-photo-container">
            <img 
              src="https://placehold.co/150" 
              alt="Profile" 
              className="profile-photo" 
            />
            <button className="edit-photo-btn">
              <FaCamera />
            </button>
          </div>
          
          <div className="profile-info">
            <div className="profile-name-section">
              <div className="profile-name-and-buttons">
                <div>
                  <h1>John Doe</h1>
                  <p className="headline">Software Engineer at MiniLid Inc.</p>
                  <p className="location">
                    <FaMapMarkerAlt /> Jakarta, Indonesia
                  </p>
                  <p className="connections">500+ connections</p>
                </div>
                <div className="profile-buttons">
                  <button className="primary-btn">
                    <FaUserPlus /> Connect
                  </button>
                  <button className="secondary-btn">Message</button>
                  <button className="secondary-btn">More</button>
                </div>
              </div>
              
              <div className="company-badges">
                <div className="company-badge">
                  <img src="https://placehold.co/40" alt="Company logo" />
                  <span>MiniLid Inc.</span>
                </div>
                <div className="company-badge">
                  <img src="https://placehold.co/40" alt="University logo" />
                  <span>University of Indonesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* About section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>About</h2>
          <button className="edit-btn">
            <FaPen />
          </button>
        </div>
        <div className="section-content">
          <p>
            Experienced Software Engineer with a passion for developing innovative 
            applications that expedite the efficiency and effectiveness of organizational 
            success. Well-versed in technology and writing code to create systems that 
            are reliable and user-friendly. Skilled leader who has the proven ability 
            to motivate, educate, and manage a team to build software programs and 
            effectively track changes.
          </p>
        </div>
      </div>
      
      {/* Experience section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>Experience</h2>
          <div>
            <button className="icon-btn">
              <FaPlus />
            </button>
            <button className="edit-btn">
              <FaPen />
            </button>
          </div>
        </div>
        
        <div className="experience-item">
          <div className="experience-logo">
            <img src="https://placehold.co/60" alt="Company Logo" />
          </div>
          <div className="experience-details">
            <h3>Software Engineer</h3>
            <p className="company-name">MiniLid Inc. · Full-time</p>
            <p className="date-range">Jan 2021 - Present · 2 yrs 4 mos</p>
            <p className="location">Jakarta, Indonesia</p>
            <p className="description">
              Developing and maintaining web applications using React, Node.js, 
              and PostgreSQL. Leading a team of junior developers and mentoring them.
            </p>
          </div>
        </div>
        
        <div className="experience-item">
          <div className="experience-logo">
            <img src="https://placehold.co/60" alt="Company Logo" />
          </div>
          <div className="experience-details">
            <h3>Junior Developer</h3>
            <p className="company-name">Tech Solutions · Full-time</p>
            <p className="date-range">Jun 2018 - Dec 2020 · 2 yrs 7 mos</p>
            <p className="location">Jakarta, Indonesia</p>
            <p className="description">
              Developed front-end interfaces using HTML, CSS, and JavaScript.
              Collaborated with senior developers to implement new features.
            </p>
          </div>
        </div>
      </div>
      
      {/* Education section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>Education</h2>
          <div>
            <button className="icon-btn">
              <FaPlus />
            </button>
            <button className="edit-btn">
              <FaPen />
            </button>
          </div>
        </div>
        
        <div className="education-item">
          <div className="education-logo">
            <img src="https://placehold.co/60" alt="University Logo" />
          </div>
          <div className="education-details">
            <h3>University of Indonesia</h3>
            <p className="degree">Bachelor of Science in Computer Science</p>
            <p className="date-range">2014 - 2018</p>
            <p className="description">
              Activities and societies: Computer Science Club, Hackathon Participant
            </p>
          </div>
        </div>
      </div>
      
      {/* Skills section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>Skills</h2>
          <div>
            <button className="icon-btn">
              <FaPlus />
            </button>
            <button className="edit-btn">
              <FaPen />
            </button>
          </div>
        </div>
        
        <div className="skills-list">
          <div className="skill-item">
            <h3>JavaScript</h3>
            <p>7 endorsements</p>
          </div>
          <div className="skill-item">
            <h3>React.js</h3>
            <p>15 endorsements</p>
          </div>
          <div className="skill-item">
            <h3>Node.js</h3>
            <p>12 endorsements</p>
          </div>
          <div className="skill-item">
            <h3>SQL</h3>
            <p>8 endorsements</p>
          </div>
          <div className="skill-item">
            <h3>Git</h3>
            <p>10 endorsements</p>
          </div>
        </div>
        
        <button className="show-more-btn">Show all 12 skills</button>
      </div>
    </div>
  );
};

export default Profile;