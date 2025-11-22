import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      delayChildren: 0.2,
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

const jobCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120
    }
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await api.get('/api/jobs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter(job => job.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete job');
    }
  };

  const handleEdit = (job) => {
    navigate(`/dashboard/edit-job`, { state: { job } });
  };

  const handleApply = async (jobId) => {
    const token = localStorage.getItem('token');
    try {
      await api.post(
        `/api/applications/apply/${jobId}`,
        { cover_letter: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local job status
      setJobs(prev =>
        prev.map(job =>
          job.id === jobId ? { ...job, status: 'Applied' } : job
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to apply');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-800 border-blue-200',
      'Applied': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Interview': 'bg-purple-100 text-purple-800 border-purple-200',
      'Offered': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Open': '📋',
      'Applied': '📨',
      'Interview': '🤝',
      'Offered': '🎉',
      'Rejected': '❌'
    };
    return icons[status] || '📊';
  };

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter);

  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading your jobs...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" variants={itemVariants}>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            My Job Applications
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Track and manage all your job applications in one place
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            onClick={() => navigate('/dashboard/add-job')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Job
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/dashboard/profile')}
            className="bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Update Profile
          </motion.button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-xl p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Filter Section */}
      <motion.div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20" variants={itemVariants}>
        <div className="flex flex-wrap gap-2">
          {['all', 'Open', 'Applied', 'Interview', 'Offered', 'Rejected'].map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filter === status
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === 'all' ? 'All Jobs' : status}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Table Header - Desktop */}
      <motion.div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20" variants={itemVariants}>
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
          <div className="col-span-3">Company & Position</div>
          <div className="col-span-2">Date Applied</div>
          <div className="col-span-4">Notes</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
      </motion.div>

      {/* Jobs List */}
      <AnimatePresence>
        {filteredJobs.length === 0 ? (
          <motion.div 
            className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'all' ? 'No jobs yet' : `No ${filter.toLowerCase()} jobs`}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {filter === 'all' 
                ? "Start tracking your job applications by adding your first job opportunity."
                : `You don't have any jobs with status "${filter}" yet.`
              }
            </p>
            <motion.button
              onClick={() => navigate('/dashboard/add-job')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Your First Job
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
          >
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden"
                variants={jobCardVariants}
                whileHover="hover"
                layout
              >
                <div className="p-6">
                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Company & Position */}
                      <div className="col-span-3">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {job.company}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {job.position}
                        </p>
                      </div>

                      {/* Date Applied */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{new Date(job.date_applied).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="col-span-4">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {job.notes || <span className="text-gray-400 italic">No notes added</span>}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <motion.span 
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-base">{getStatusIcon(job.status)}</span>
                          {job.status}
                        </motion.span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            onClick={() => handleEdit(job)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit Job"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleApply(job.id)}
                            disabled={job.status !== 'Open'}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              job.status !== 'Open' 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            whileHover={job.status === 'Open' ? { scale: 1.1 } : {}}
                            whileTap={job.status === 'Open' ? { scale: 0.9 } : {}}
                            title="Apply to Job"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleDelete(job.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete Job"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {job.company}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {job.position}
                        </p>
                        <motion.span 
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}
                        >
                          <span>{getStatusIcon(job.status)}</span>
                          {job.status}
                        </motion.span>
                      </div>
                      <div className="flex gap-1">
                        <motion.button
                          onClick={() => handleEdit(job)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleApply(job.id)}
                          disabled={job.status !== 'Open'}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            job.status !== 'Open' 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          whileTap={job.status === 'Open' ? { scale: 0.9 } : {}}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleDelete(job.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(job.date_applied).toLocaleDateString()}</span>
                      </div>
                      
                      {job.notes && (
                        <div className="col-span-2 flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {job.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      {jobs.length > 0 && (
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
          variants={itemVariants}
        >
          <h4 className="font-semibold text-gray-800 mb-3">Application Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {['Open', 'Applied', 'Interview', 'Offered', 'Rejected'].map((status) => (
              <div key={status} className="text-center">
                <div className={`text-2xl font-bold ${getStatusColor(status).split(' ')[1]}`}>
                  {jobs.filter(job => job.status === status).length}
                </div>
                <div className="text-sm text-gray-600">{status}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default JobList;