import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Animation Variants ---

// Container variants for staggered entrance of main blocks
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
      duration: 0.8
    }
  }
};

// Item variants for spring-like entrance of text/buttons
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12
    }
  }
};

// Feature card variants for entrance and hover effects
const featureVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  hover: {
    scale: 1.05,
    y: -5,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

function Home() {
  return (
    // Enhanced background with gradient and responsive padding
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Animated background elements for visual depth */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
          rotate: [0, 360],
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
          rotate: [360, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Content Container: Centered, responsive, animated */}
      <motion.div
        className="max-w-4xl w-full mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-10 lg:p-14 text-center relative z-10 border border-white/20"
        variants={containerVariants}
      >

        {/* Enhanced Main Heading: Responsive font sizes */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight"
          variants={itemVariants}
        >
          Job Application
          <motion.span
            className="block mt-1 sm:mt-2 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-gray-800"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
          >
            Tracker Pro
          </motion.span>
        </motion.h1>

        {/* Enhanced Subtitle: Responsive font sizes and layout */}
        <motion.p
          className="text-xl sm:text-2xl text-gray-700 mb-8 font-medium max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          <strong className="font-extrabold text-gray-900">Track every application</strong>, never miss an update.
          <span className="block text-base sm:text-lg text-gray-600 font-normal mt-2">
            Your complete career search management solution
          </span>
        </motion.p>

        {/* Enhanced Features Grid: Stacks on mobile, 3 columns on medium/large screens */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mb-10"
          variants={containerVariants}
        >
          {[
            {
              icon: "📊",
              title: "Centralized Hub",
              description: "All your applications in one secure, organized place"
            },
            {
              icon: "🔔",
              title: "Smart Alerts",
              description: "Real-time status changes and follow-up reminders"
            },
            {
              icon: "📈",
              title: "Progress Insights",
              description: "Analytics to optimize your job search strategy"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm transition-all duration-300 group cursor-pointer"
              variants={featureVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-blue-700 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA Buttons: Stacks on mobile, side-by-side on small screens */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/register"
              className="group relative w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg py-3 px-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                Start Tracking Now
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🚀
                </motion.span>
              </span>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/login"
              className="group w-full sm:w-auto bg-white/90 text-gray-800 text-lg py-3 px-8 rounded-xl font-semibold shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 hover:bg-gray-100 block"
            >
              <span className="relative">
                Already a User?
                <span className="font-bold text-blue-600 ml-1 group-hover:underline">
                  Login
                </span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Footer */}
      <motion.div
        className="mt-8 text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-sm text-gray-300 font-medium">
          Built with ❤️ by Khalipha-Jibreel
        </p>
        <motion.p
          className="text-xs text-gray-400 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Track smarter • Interview better • Land faster
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default Home;