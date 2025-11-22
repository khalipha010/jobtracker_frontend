import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

// Animation variants matching other components
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

function Verify() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setIsLoading(true);
      api.get(`/auth/verify?token=${token}`)
        .then((response) => {
          setMessage(response.data.message || 'Email verified successfully');
          setTimeout(() => navigate('/login'), 2000);
        })
        .catch((err) => {
          setMessage(err.response?.data?.error || 'Verification failed. Please try again.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setMessage('No verification token provided');
      setIsLoading(false);
    }
  }, [searchParams, navigate]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 sm:p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      
      {/* Background animated elements matching other components */}
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
        className="max-w-md w-full bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 border border-white/20 text-center"
        variants={containerVariants}
      >
        
        {/* Header */}
        <motion.h2 
          className="text-3xl font-black text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8"
          variants={itemVariants}
        >
          Email Verification
        </motion.h2>
        
        {/* Loading State */}
        {isLoading ? (
          <motion.div variants={itemVariants}>
            <motion.div
              className="flex items-center justify-center mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.svg 
                className="animate-spin h-12 w-12 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </motion.svg>
            </motion.div>
            <motion.p 
              className="text-lg text-gray-700 font-medium"
              variants={itemVariants}
            >
              Verifying your email...
            </motion.p>
            <motion.p 
              className="text-sm text-gray-500 mt-2"
              variants={itemVariants}
            >
              Please wait while we confirm your email address
            </motion.p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            {/* Success State */}
            {(message.includes('success') || message.includes('verified')) ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </motion.div>
                <motion.p 
                  className="text-lg text-green-700 font-medium mb-2"
                  variants={itemVariants}
                >
                  ✅ Verification Successful!
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-600"
                  variants={itemVariants}
                >
                  {message}
                </motion.p>
                <motion.p 
                  className="text-xs text-gray-500 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Redirecting to login page...
                </motion.p>
              </motion.div>
            ) : (
              /* Error State */
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <motion.div
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </motion.div>
                <motion.p 
                  className="text-lg text-red-700 font-medium mb-2"
                  variants={itemVariants}
                >
                  ❌ Verification Failed
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-600 mb-4"
                  variants={itemVariants}
                >
                  {message}
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => navigate('/register')}
                    className="text-blue-600 font-semibold hover:underline text-sm"
                  >
                    Try registering again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Verify;