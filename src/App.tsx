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
import CreateJob from './view/CreateJob';

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
    <AuthProvider>
      <ModalProvider>
        <Navbar />

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Job />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-job" element={<CreateJob />} />
          </Routes>
        </main>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;