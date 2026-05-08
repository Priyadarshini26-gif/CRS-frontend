import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI } from '../services/api';
import Map from '../components/Map';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetchIssueDetail();
  }, [id]);

  const fetchIssueDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await issuesAPI.getIssueById(id);
      setIssue(response.data.issue);
      
      const userId = localStorage.getItem('userId');
      if (response.data.issue.voters && response.data.issue.voters.some(v => v._id === userId || v === userId)) {
        setVoted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issue');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (voted) return;
    
    setVoting(true);
    try {
      await issuesAPI.voteOnIssue(id);
      setVoted(true);
      fetchIssueDetail();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading issue details...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-500 hover:underline"
            >
              ← Back
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Issue not found'}
          </div>
        </main>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusColor(issue.status)}`}>
                {issue.status.toUpperCase()}
              </span>
              <p className="text-sm text-gray-600 mt-2">
                Category: <span className="font-semibold">{issue.category.replace('_', ' ').toUpperCase()}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">👍 {issue.votes}</p>
              <p className="text-sm text-gray-600">votes</p>
            </div>
          </div>

          <hr className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>

              {issue.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900">Rejection Reason</p>
                  <p className="text-red-800 mt-2">{issue.rejectionReason}</p>
                </div>
              )}

              {issue.resolutionNote && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-900">Resolution Note</p>
                  <p className="text-green-800 mt-2">{issue.resolutionNote}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
              {issue.location && (
                <>
                  <Map 
                    initialLocation={issue.location.coordinates}
                    readOnly={true}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Coordinates: {issue.location.coordinates[0].toFixed(4)}, {issue.location.coordinates[1].toFixed(4)}
                  </p>
                </>
              )}
            </div>
          </div>

          {issue.imageUrl && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Issue Image</h3>
              <img 
                src={issue.imageUrl} 
                alt="Issue" 
                className="w-full max-w-md rounded-lg border border-gray-300"
              />
            </div>
          )}

          {issue.resolutionImage && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Resolution Image</h3>
              <img 
                src={issue.resolutionImage} 
                alt="Resolution" 
                className="w-full max-w-md rounded-lg border border-gray-300"
              />
            </div>
          )}

          <hr className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Reported By</h4>
              <p className="text-gray-700">{issue.createdBy?.name}</p>
              <p className="text-sm text-gray-600">{issue.createdBy?.email}</p>
              <p className="text-sm text-gray-600 mt-2">
                Address: {issue.createdBy?.address}
              </p>
            </div>

            {issue.assignedTo && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Assigned To</h4>
                <p className="text-gray-700">{issue.assignedTo?.name}</p>
                <p className="text-sm text-gray-600">{issue.assignedTo?.email}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
              <p className="text-sm text-gray-600">
                Reported: {new Date(issue.createdAt).toLocaleString()}
              </p>
              {issue.approvedAt && (
                <p className="text-sm text-gray-600">
                  Approved: {new Date(issue.approvedAt).toLocaleString()}
                </p>
              )}
              {issue.approvalDeadline && (
                <p className="text-sm text-gray-600">
                  Deadline: {new Date(issue.approvalDeadline).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleVote}
              disabled={voted || voting}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                voted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {voting ? 'Voting...' : voted ? '✓ Voted' : 'Vote for This Issue'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IssueDetail;
