import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api'; // Using the real API utility

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
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
      damping: 10
    }
  }
};

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);
   
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setIsError(false);
     
      // Redirect to login after a delay to show the success message
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send reset link. Please try again.';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const messageClassName = isError
    ? "p-3 bg-red-100 text-red-700"
    : "p-3 bg-green-100 text-green-700";

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 sm:p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="max-w-md w-full bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 border border-white/20"
        variants={containerVariants}
      >
        <motion.h2
          className="text-3xl font-black text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8"
          variants={itemVariants}
        >
          Reset Your Password
        </motion.h2>
        {message && (
          <motion.p
            className={`text-sm mb-6 rounded-lg font-medium ${messageClassName}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {message}
          </motion.p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.p className="text-sm text-gray-600 mb-4" variants={itemVariants}>
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </motion.p>
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
              Email Address
            </label>
            <motion.input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm transition duration-150"
              required
              disabled={isLoading}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              whileHover={{
                scale: isLoading ? 1 : 1.02,
                boxShadow: "0 10px 25px -3px rgba(59, 130, 246, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </motion.button>
          </motion.div>
        </form>
        <motion.div
          className="mt-6 text-center"
          variants={itemVariants}
        >
          <motion.p className="text-sm text-gray-600" variants={itemVariants}>
            Remember your password?{' '}
            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Login
              </Link>
            </motion.span>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ForgotPassword;