import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import IssueCard from '../components/IssueCard';

const MyIssues = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMyIssues();
  }, [page]);

  const fetchMyIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await issuesAPI.getMyIssues({ page, limit: 10 });
      setIssues(response.data.issues);
      setTotal(response.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your issues');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">My Reported Issues</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">You haven't reported any issues yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Report Your First Issue
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} issues
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {issues.map(issue => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  onViewDetails={handleViewDetails}
                  onVote={() => {}}
                  showVote={false}
                />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      page === p
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyIssues;
