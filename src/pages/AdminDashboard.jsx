import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    statusBreakdown: { Pending: 0, Shortlisted: 0, Accepted: 0, Rejected: 0 },
  });
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    ageMin: "",
    ageMax: "",
    degreeClass: "",
  });
  const [loading, setLoading] = useState({ stats: false, apps: false });
  const [batchStatus, setBatchStatus] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchStats = useCallback(async () => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, stats: true }));
      const res = await axios.get(`${apiUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, [apiUrl, token, navigate]);

  const fetchApplications = useCallback(async () => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, apps: true }));
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const res = await axios.get(`${apiUrl}/api/admin/applications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched applications:', res.data);
      setApplications(res.data);
    } catch (err) {
      console.error("Applications fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    } finally {
      setLoading((prev) => ({ ...prev, apps: false }));
    }
  }, [apiUrl, token, filters, navigate]);

  useEffect(() => {
    fetchStats();
    fetchApplications();
  }, [fetchStats, fetchApplications]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    const oldApplications = [...applications];
    setApplications(
      applications.map((app) =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );

    try {
      await axios.put(
        `${apiUrl}/api/admin/applications/${appId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications();
      fetchStats();
    } catch (err) {
      console.error("Status update error:", err);
      setApplications(oldApplications);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    }
  };

  const handleBatchUpdate = async () => {
    if (!batchStatus || !["Pending", "Accepted", "Shortlisted", "Rejected"].includes(batchStatus)) {
      alert("Please select a valid status for batch update.");
      return;
    }

    const idsToUpdate = applications
      .filter((app) => app.status !== batchStatus)
      .map((app) => app.id);

    if (idsToUpdate.length === 0) {
      alert("No applications to update.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, apps: true }));
      await axios.post(
        `${apiUrl}/api/admin/applications/batch-status`,
        { ids: idsToUpdate, status: batchStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications();
      fetchStats();
      setBatchStatus("");
      alert(`Updated ${idsToUpdate.length} applications to ${batchStatus}. Emails will be sent in batch.`);
    } catch (err) {
      console.error("Batch update error:", err);
      alert("Batch update failed.");
    } finally {
      setLoading((prev) => ({ ...prev, apps: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Shortlisted': 'bg-purple-100 text-purple-800 border-purple-200',
      'Accepted': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '⏳',
      'Shortlisted': '📋',
      'Accepted': '🎉',
      'Rejected': '💼'
    };
    return icons[status] || '📊';
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard 👑
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Manage job applications and candidate tracking
            </p>
          </div>
          <motion.button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mt-4 sm:mt-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Total Applications */}
          <motion.div 
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 text-center"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-blue-600">
              {loading.stats ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
                />
              ) : (
                stats.totalApplications
              )}
            </p>
          </motion.div>

          {/* Status Breakdown Cards */}
          {['Pending', 'Shortlisted', 'Accepted', 'Rejected'].map((status) => (
            <motion.div 
              key={status}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 text-center"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl mb-2">{getStatusIcon(status)}</div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{status}</h3>
              <p className="text-2xl font-bold" style={{ color: getStatusColor(status).split(' ')[1] }}>
                {loading.stats ? "-" : stats.statusBreakdown[status]}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Batch Update Section */}
        <motion.div 
          className="mb-8 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Batch Status Update
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <motion.select
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">Select Status for Batch Update</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Shortlisted">📋 Shortlisted</option>
              <option value="Accepted">🎉 Accepted</option>
              <option value="Rejected">💼 Rejected</option>
            </motion.select>
            <motion.button
              onClick={handleBatchUpdate}
              disabled={loading.apps || !batchStatus}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!loading.apps && batchStatus ? { scale: 1.05 } : {}}
              whileTap={!loading.apps && batchStatus ? { scale: 0.95 } : {}}
            >
              {loading.apps ? (
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
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update Batch
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          className="mb-6 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Filter Applicants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Shortlisted">📋 Shortlisted</option>
              <option value="Accepted">🎉 Accepted</option>
              <option value="Rejected">💼 Rejected</option>
            </motion.select>
            
            <motion.input
              name="ageMin"
              value={filters.ageMin}
              onChange={handleFilterChange}
              placeholder="Minimum Age"
              type="number"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
            />
            
            <motion.input
              name="ageMax"
              value={filters.ageMax}
              onChange={handleFilterChange}
              placeholder="Maximum Age"
              type="number"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
            />
            
            <motion.select
              name="degreeClass"
              value={filters.degreeClass}
              onChange={handleFilterChange}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 bg-white/50 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="">All Degree Classes</option>
              <option value="First Class">First Class</option>
              <option value="Second Class Upper">Second Class Upper</option>
              <option value="Second Class Lower">Second Class Lower</option>
              <option value="Third Class">Third Class</option>
              <option value="Credit">Credit</option>
              <option value="Distinction">Distinction</option>
              <option value="N/A">N/A</option>
            </motion.select>
          </div>
        </motion.div>

        {/* Applications Table */}
        <motion.div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
              Applications ({applications.length})
            </h2>
          </div>

          <div className="p-6 overflow-x-auto">
            {loading.apps ? (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Applicant', 'Job', 'Age', 'Degree', 'Status', 'Applied', 'CV', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app, index) => (
                    <motion.tr 
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {/* Profile Picture with Fallback */}
                          {app.profile_picture ? (
                            <motion.img
                              src={app.profile_picture}
                              alt={`${app.name}'s profile`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              whileHover={{ scale: 1.1 }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm ${app.profile_picture ? 'hidden' : 'flex'}`}
                          >
                            {app.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {app.name}
                            </div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {app.position}
                        </div>
                        <div className="text-sm text-gray-500">{app.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.age || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.degree_class || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.span 
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <span>{getStatusIcon(app.status)}</span>
                          {app.status}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.cv_url ? (
                          <motion.a
                            href={`${apiUrl}/api/applications/${app.id}/cv/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View CV
                          </motion.a>
                        ) : (
                          <span className="text-gray-400 text-sm">No CV</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-white"
                          whileFocus={{ scale: 1.02 }}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Shortlisted">📋 Shortlisted</option>
                          <option value="Accepted">🎉 Accepted</option>
                          <option value="Rejected">💼 Rejected</option>
                        </motion.select>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;