import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import IssueCard from '../components/IssueCard';
import Map from '../components/Map';

const IssueList = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userVotes, setUserVotes] = useState(new Set());

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await issuesAPI.getIssues({
        ...filters,
        limit: 10
      });
      setIssues(response.data.issues);
      setTotal(response.data.total);
      
      // Get user's votes
      const votes = new Set();
      response.data.issues.forEach(issue => {
        const userId = localStorage.getItem('userId');
        if (issue.voters && issue.voters.some(v => v._id === userId || v === userId)) {
          votes.add(issue._id);
        }
      });
      setUserVotes(votes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handleVote = async (issueId) => {
    try {
      await issuesAPI.voteOnIssue(issueId);
      setUserVotes(prev => new Set(prev).add(issueId));
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to vote');
    }
  };

  const handleViewDetails = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  const pages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Civic Issues</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'map'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Map View
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Sort By</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Most Recent</option>
                <option>Most Voted</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading issues...</p>
          </div>
        ) : viewMode === 'list' ? (
          <>
            {issues.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">No issues found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {issues.map(issue => (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      onViewDetails={handleViewDetails}
                      onVote={handleVote}
                      userHasVoted={userVotes.has(issue._id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setFilters(prev => ({ ...prev, page }))}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          filters.page === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            <Map readOnly={true} />
          </div>
        )}
      </main>
    </div>
  );
};

export default IssueList;
