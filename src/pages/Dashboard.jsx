import { useEffect, useState } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import ProfileForm from '../components/ProfileForm';
import JobForm from '../components/JobForm';
import JobList from '../components/JobList';
import JobApplicationForm from '../components/JobApplicationForm';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      delayChildren: 0.3,
      staggerChildren: 0.1
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const notificationVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200
    }
  },
  exit: { opacity: 0, scale: 0.8, y: -20 }
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    api
      .get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  // Fetch notifications every 10s
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = () => {
      api
        .get('/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => {
          setNotifications(res.data);
        })
        .catch((err) => console.error('Error fetching notifications', err));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSaveJob = () => {
    navigate('/dashboard');
    setIsMobileMenuOpen(false);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Mobile Menu Button */}
        <motion.div 
          className="lg:hidden mb-4"
          variants={itemVariants}
        >
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-white/80 backdrop-blur-lg rounded-xl p-3 shadow-lg border border-white/20 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={`${user.name}'s profile`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <h2 className="font-bold text-gray-800 text-sm leading-tight">
                  Welcome back, {user.name.split(' ')[0]}! 👋
                </h2>
                <p className="text-xs text-gray-600">Ready to find your dream job?</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
        </motion.div>

        {/* Desktop Header */}
        <motion.div 
          className="hidden lg:flex justify-between items-center mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={`${user.name}'s profile`}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">Ready to track your job applications?</p>
            </div>
          </div>
          
          <div className="flex gap-2 sm:gap-3 items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.93 4.93l9.07 9.07-9.07 9.07L4.93 4.93z" />
                </svg>
                <span className="hidden sm:inline">Notifications</span>
                {notifications.some((n) => !n.read) && (
                  <motion.span 
                    className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="hidden sm:inline">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </motion.span>
                )}
              </button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/dashboard/profile" 
                className="bg-white text-gray-700 py-2 px-3 sm:px-4 rounded-xl font-semibold shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/dashboard/add-job" 
                className="bg-green-600 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-green-700 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Job</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="lg:hidden mb-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 text-sm"
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.93 4.93l9.07 9.07-9.07 9.07L4.93 4.93z" />
                  </svg>
                  Notifications
                  {notifications.some((n) => !n.read) && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </motion.button>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/dashboard/profile" 
                    className="bg-white text-gray-700 py-3 px-4 rounded-xl font-semibold shadow-md border border-gray-200 flex items-center justify-center gap-2 text-sm block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/dashboard/add-job" 
                    className="bg-green-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 text-sm block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Job
                  </Link>
                </motion.div>

                <motion.button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 text-sm"
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rest of the component remains the same... */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div 
              className="mb-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6"
              variants={notificationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                  Notifications
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {notifications.length === 0 ? (
                <motion.div 
                  className="text-center py-6 sm:py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm sm:text-base">No notifications yet.</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">We'll notify you when something important happens.</p>
                </motion.div>
              ) : (
                <motion.ul className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto" variants={containerVariants}>
                  {notifications.map((n) => (
                    <motion.li
                      key={n._id}
                      className={`p-3 sm:p-4 rounded-xl border-l-4 transition-all duration-300 cursor-pointer ${
                        n.read 
                          ? 'bg-gray-50 border-gray-300 hover:bg-gray-100' 
                          : 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                      }`}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => markNotificationAsRead(n._id)}
                    >
                      <div className="flex justify-between items-start">
                        <p className={`text-xs sm:text-sm font-medium ${n.read ? 'text-gray-700' : 'text-blue-900'}`}>
                          {n.message}
                        </p>
                        {!n.read && (
                          <motion.span 
                            className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6"
          variants={itemVariants}
        >
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/profile" element={<ProfileForm />} />
            <Route path="/add-job" element={<JobForm onSave={handleSaveJob} />} />
            <Route path="/edit-job" element={<JobForm onSave={handleSaveJob} />} />
            <Route path="/apply/:jobId" element={<JobApplicationForm />} />
          </Routes>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;