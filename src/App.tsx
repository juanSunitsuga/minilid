import { AnimatePresence } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './view/Context/AuthContext';
import { ModalProvider } from './view/Context/ModalContext';
import Navbar from './view/Components/Navbar';

// Import views
import Home from './view/Home';
import Profile from './view/Profile/Profile';
import Job from './view/Job/Job';
import Chat from './view/Chat/Chat';
import CreateJob from './view/CreateJob';
import Dashboard from './view/Dashboard/Dashboard';
import JobDetail from './view/Job/JobDetail';
import ViewProfile from './view/Profile/ViewProfile';

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Job />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<ViewProfile />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/job/:jobId" element={<JobDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;