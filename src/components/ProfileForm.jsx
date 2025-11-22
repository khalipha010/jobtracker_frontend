import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function ProfileForm() {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    bio: '', 
    location: '', 
    education_level: '', 
    education_grade: '', 
    age: '', 
    experience: '', 
    cv: null 
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const token = localStorage.getItem('token');
        const response = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          bio: response.data.bio || '',
          location: response.data.location || '',
          education_level: response.data.education_level || '',
          education_grade: response.data.education_grade || '',
          age: response.data.age || '',
          experience: response.data.experience || '',
          cv: null,
          profile_picture: response.data.profile_picture || '',
        });
        setSkillsInput(Array.isArray(response.data.skills) ? response.data.skills.join(', ') : '');
      } catch (err) {
        console.error(err);
        setMessage('Failed to load profile');
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleCvChange = (e) => {
    setFormData({ ...formData, cv: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    data.append('education_level', formData.education_level);
    data.append('education_grade', formData.education_grade);
    data.append('age', formData.age);
    data.append('experience', formData.experience);
    if (image) data.append('profile_picture', image);
    if (formData.cv) data.append('cv', formData.cv);
    data.append('skills', skillsInput);

    try {
      const response = await api.put('/auth/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message || 'Profile updated successfully');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-3">
            Edit Your Profile
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Update your personal information and professional details
          </p>
        </motion.div>

        {/* Success Message */}
        {message && (
          <motion.div 
            className={`rounded-xl p-4 mb-6 ${
              message.includes('success') 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.includes('success') ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`w-4 h-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={message.includes('success') ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                </svg>
              </div>
              <p className={`text-sm font-medium ${message.includes('success') ? 'text-green-700' : 'text-red-700'}`}>
                {message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8"
          variants={formVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Personal Information */}
            <div className="space-y-6">
              <motion.h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2" variants={itemVariants}>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </motion.h3>

              {/* Profile Picture - Centered */}
              <motion.div variants={itemVariants}>
                <label htmlFor="profile_picture" className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  Profile Picture
                </label>
                
                {/* Current Profile Picture Display - Centered */}
                {formData.profile_picture && (
                  <motion.div 
                    className="flex justify-center mb-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="text-center">
                      <img 
                        src={formData.profile_picture} 
                        alt="Profile" 
                        className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg mx-auto" 
                      />
                      <p className="text-sm text-gray-600 mt-2">Current profile picture</p>
                    </div>
                  </motion.div>
                )}

                {/* File Input - Centered */}
                <div className="flex justify-center">
                  <motion.input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full max-w-md p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Upload a new profile picture (JPG, PNG, etc.)</p>
              </motion.div>

              {/* Name */}
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <motion.input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  required
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  placeholder="Enter your full name"
                />
              </motion.div>

              {/* Phone */}
              <motion.div variants={itemVariants}>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <motion.input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  placeholder="Enter your phone number"
                />
              </motion.div>

              {/* Location */}
              <motion.div variants={itemVariants}>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <motion.input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  placeholder="Enter your city and country"
                />
              </motion.div>

              {/* Age */}
              <motion.div variants={itemVariants}>
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <motion.input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="150"
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  placeholder="Enter your age"
                />
              </motion.div>
            </div>

            {/* Right Column - Professional Information */}
            <div className="space-y-6">
              <motion.h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2" variants={itemVariants}>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Professional Information
              </motion.h3>

              {/* Bio */}
              <motion.div variants={itemVariants}>
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                  Professional Bio
                </label>
                <motion.textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  rows="3"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  placeholder="Tell us about yourself, your career goals, and what you're looking for..."
                />
              </motion.div>

              {/* Skills */}
              <motion.div variants={itemVariants}>
                <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-2">
                  Skills
                </label>
                <motion.input
                  type="text"
                  name="skills"
                  value={skillsInput}
                  onChange={handleSkillsChange}
                  placeholder="React.js, Node.js, Python, etc."
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <p className="text-xs text-gray-500 mt-2">Separate skills with commas</p>
              </motion.div>

              {/* Education Level */}
              <motion.div variants={itemVariants}>
                <label htmlFor="education_level" className="block text-sm font-semibold text-gray-700 mb-2">
                  Education Level
                </label>
                <motion.select
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </motion.select>
              </motion.div>

              {/* Education Grade */}
              <motion.div variants={itemVariants}>
                <label htmlFor="education_grade" className="block text-sm font-semibold text-gray-700 mb-2">
                  Education Grade
                </label>
                <motion.select
                  name="education_grade"
                  value={formData.education_grade}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="">Select Grade</option>
                  <option value="First Class">First Class</option>
                  <option value="Second Class Upper">Second Class Upper</option>
                  <option value="Second Class Lower">Second Class Lower</option>
                  <option value="Third Class">Third Class</option>
                  <option value="Credit">Credit</option>
                  <option value="Distinction">Distinction</option>
                  <option value="N/A">N/A</option>
                </motion.select>
              </motion.div>

              {/* Experience */}
              <motion.div variants={itemVariants}>
                <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Experience
                </label>
                <motion.textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  rows="3"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  placeholder="Describe your work experience, projects, and achievements..."
                />
              </motion.div>

              {/* CV Upload */}
              <motion.div variants={itemVariants}>
                <label htmlFor="cv" className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload CV (PDF)
                </label>
                <motion.input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <p className="text-xs text-gray-500 mt-2">Upload your CV in PDF format</p>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-200" variants={itemVariants}>
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
                  <span>Updating Profile...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Profile</span>
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
        </motion.form>
      </div>
    </motion.div>
  );
}

export default ProfileForm;