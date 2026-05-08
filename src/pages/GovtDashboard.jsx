import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { govtAPI } from '../services/api';

const GovtDashboard = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [statistics, setStatistics] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [formData, setFormData] = useState({
    status: 'in-progress',
    resolutionNote: '',
    resolutionImage: ''
  });

  useEffect(() => {
    fetchIssuesAndStats();
  }, [status]);

  const fetchIssuesAndStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [issuesRes, statsRes] = await Promise.all([
        govtAPI.getIssues({ status, limit: 20 }),
        govtAPI.getStatistics()
      ]);
      setIssues(issuesRes.data.issues);
      setStatistics(statsRes.data.statistics);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!formData.resolutionNote.trim()) {
      setError('Please provide a resolution note');
      return;
    }

    try {
      await govtAPI.updateStatus(selectedIssue._id, {
        status: formData.status,
        resolutionNote: formData.resolutionNote,
        resolutionImage: formData.resolutionImage
      });
      setSuccess(`Issue marked as ${formData.status}`);
      setShowStatusModal(false);
      setFormData({ status: 'in-progress', resolutionNote: '', resolutionImage: '' });
      setSelectedIssue(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchIssuesAndStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          resolutionImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusClick = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      status: 'in-progress',
      resolutionNote: '',
      resolutionImage: ''
    });
    setShowStatusModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Government Official Dashboard</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold">Total Issues</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{statistics.totalIssues || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold">In Progress</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{statistics.inProgressIssues || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold">Resolved</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{statistics.resolvedIssues || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold">Resolution Rate</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{statistics.resolutionRate || '0%'}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-gray-700 font-semibold mb-2">Filter by Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No issues assigned to you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map(issue => (
              <div
                key={issue._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{issue.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{issue.description.substring(0, 100)}...</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    issue.status === 'resolved' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {issue.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900">{issue.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reported By</p>
                    <p className="font-semibold text-gray-900">{issue.createdBy?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Votes</p>
                    <p className="font-semibold text-gray-900">👍 {issue.votes}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">{new Date(issue.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {issue.status !== 'resolved' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusClick(issue)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                      Update Status
                    </button>
                  </div>
                )}

                {issue.resolutionNote && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900">Resolution Note</p>
                    <p className="text-green-800 text-sm mt-2">{issue.resolutionNote}</p>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/issues/${issue._id}`)}
                  className="mt-4 text-blue-500 hover:underline text-sm font-semibold"
                >
                  View Full Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Issue Status</h2>
            <p className="text-gray-700 mb-6">{selectedIssue.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Resolution Note *</label>
                <textarea
                  value={formData.resolutionNote}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolutionNote: e.target.value }))}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the resolution or progress..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Resolution Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {formData.resolutionImage && (
                  <div className="mt-2 relative w-24 h-24 border border-gray-300 rounded">
                    <img src={formData.resolutionImage} alt="Preview" className="w-full h-full object-cover rounded" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setFormData({ status: 'in-progress', resolutionNote: '', resolutionImage: '' });
                  setSelectedIssue(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovtDashboard;
