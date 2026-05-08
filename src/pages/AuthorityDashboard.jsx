import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorityAPI, issuesAPI } from '../services/api';
import IssueCard from '../components/IssueCard';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState('pending');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [status, sortBy]);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (sortBy === 'priority') {
        response = await authorityAPI.getPrioritySorted({ status, limit: 20 });
      } else {
        response = await authorityAPI.getIssues({ status, limit: 20 });
      }
      setIssues(response.data.issues);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (issueId) => {
    try {
      await authorityAPI.approveIssue(issueId);
      setSuccess('Issue approved successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve issue');
    }
  };

  const handleRejectClick = (issue) => {
    setSelectedIssue(issue);
    setShowRejectionModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      await authorityAPI.rejectIssue(selectedIssue._id, { rejectionReason });
      setSuccess('Issue rejected successfully');
      setRejectionReason('');
      setShowRejectionModal(false);
      setSelectedIssue(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject issue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Authority Dashboard</h1>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="priority">Priority Score</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Total Issues</label>
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xl font-bold text-blue-900">
                {issues.length}
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No issues found</p>
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
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
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

                {issue.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(issue._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(issue)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      ✕ Reject
                    </button>
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

      {/* Rejection Modal */}
      {showRejectionModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Issue</h2>
            <p className="text-gray-700 mb-6">{selectedIssue.title}</p>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Provide a clear reason for rejection..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setSelectedIssue(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
