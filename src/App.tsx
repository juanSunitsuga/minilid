import { AnimatePresence } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { ModalProvider } from './view/Context/ModalContext';
import Navbar from './components/Navbar';

// Import views
import Home from './view/Home';
import Profile from './view/Profile';
import Job from './view/Job';
import Chat from './view/Chat';

function App() {
  return (
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
  );
}

export default App;