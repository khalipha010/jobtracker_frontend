import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

function JobForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobToEdit = location.state?.job;

  const [formData, setFormData] = useState({
    company: jobToEdit?.company || '',
    position: jobToEdit?.position || '',
    status: jobToEdit?.status || 'Open',
    date_applied: jobToEdit?.date_applied || new Date().toISOString().split('T')[0],
    notes: jobToEdit?.notes || '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const token = localStorage.getItem('token');

    try {
      if (jobToEdit) {
        // Update existing job
        await api.put(`/api/jobs/${jobToEdit.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new job
        await api.post('/api/jobs', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-3">
          {jobToEdit ? 'Edit Job Application' : 'Add New Job Application'}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {jobToEdit 
            ? 'Update your job application details below'
            : 'Track a new job opportunity and stay organized'
          }
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8"
        variants={formVariants}
      >
        <div className="space-y-6">
          {/* Company Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name *
            </label>
            <motion.input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
              required
              disabled={isLoading}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              placeholder="Enter company name (e.g., Google, Microsoft)"
            />
          </motion.div>

          {/* Position Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
              Job Position *
            </label>
            <motion.input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
              required
              disabled={isLoading}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              placeholder="Enter job position (e.g., Frontend Developer, Data Scientist)"
            />
          </motion.div>

          {/* Status and Date Row */}
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-6" variants={itemVariants}>
            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Application Status *
              </label>
              <motion.select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none"
                required
                disabled={isLoading}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <option value="Open">📋 Open - Planning to apply</option>
                <option value="Applied">📨 Applied - Application submitted</option>
                <option value="Interview">🤝 Interview - In interview process</option>
                <option value="Offered">🎉 Offered - Received job offer</option>
                <option value="Rejected">❌ Rejected - Application rejected</option>
              </motion.select>
            </div>

            {/* Date Applied Field */}
            <div>
              <label htmlFor="date_applied" className="block text-sm font-semibold text-gray-700 mb-2">
                Date Applied *
              </label>
              <motion.input
                type="date"
                name="date_applied"
                value={formData.date_applied}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
                required
                disabled={isLoading}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>
          </motion.div>

          {/* Notes Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
              Notes & Comments
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <motion.textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
              rows="4"
              disabled={isLoading}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              placeholder="Add any notes about this application... (e.g., Contact person, salary range, application link, etc.)"
            />
            <p className="text-xs text-gray-500 mt-2">
              Character count: {formData.notes.length}/500
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <motion.svg 
                    className="animate-spin h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{jobToEdit ? 'Update Job' : 'Add Job'}</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
              className="flex-1 bg-white text-gray-700 py-3 sm:py-4 rounded-xl font-semibold shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </motion.button>
          </motion.div>

          {/* Form Tips */}
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6"
            variants={itemVariants}
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">Tips for better tracking:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Update status as you progress through the application process</li>
                  <li>• Add notes about contacts, salaries, or important deadlines</li>
                  <li>• Use the "Open" status for jobs you plan to apply to later</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default JobForm;