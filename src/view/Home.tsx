import React from 'react';
import './Home.css'; // Create this file if you need specific Home styling

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="content-placeholder">
        <h1>Welcome to MiniLid</h1>
        <p>Your job search platform</p>
        
        {/* Add more home page content here */}
        <div className="featured-jobs">
          <h2>Featured Jobs</h2>
          <div className="job-cards">
            <div className="job-card">
              <h3>Frontend Developer</h3>
              <p>MiniLid Inc.</p>
              <p>Jakarta, Indonesia</p>
            </div>
            <div className="job-card">
              <h3>UX Designer</h3>
              <p>Creative Solutions</p>
              <p>Remote</p>
            </div>
            <div className="job-card">
              <h3>Data Analyst</h3>
              <p>TechGrowth</p>
              <p>Bandung, Indonesia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;