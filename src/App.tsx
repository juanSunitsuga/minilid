import { AnimatePresence } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './view/Context/AuthContext';
import { ModalProvider } from './view/Context/ModalContext';
import Navbar from './view/Components/Navbar';

// Import views
import Home from './view/Home';
import Profile from './view/Profile/Profile';
import Job from './view/Job';
import Chat from './view/Chat';

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
          </Routes>
        </main>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;