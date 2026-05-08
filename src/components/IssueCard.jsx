import React from 'react';

const IssueCard = ({ issue, onViewDetails, onVote, showVote = true, userHasVoted = false }) => {
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

  const getCategoryIcon = (category) => {
    const icons = {
      pothole: '🕳️',
      drainage: '💧',
      street_light: '💡',
      garbage: '🗑️',
      water_supply: '🚰',
      road_damage: '🛣️',
      broken_sidewalk: '⚠️',
      tree_trimming: '🌳',
      other: '📋'
    };
    return icons[category] || '📍';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{issue.title}</h3>
            <p className="text-sm text-gray-500">{issue.category.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(issue.status)}`}>
          {issue.status.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>

      <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
        <span>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>
        <span>👤 {issue.createdBy?.name || 'Anonymous'}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xl">👍</span>
            <span className="font-semibold text-gray-900">{issue.votes || 0}</span>
          </div>
          {issue.rejectionReason && (
            <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
              Reason: {issue.rejectionReason}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {showVote && (
            <button
              onClick={() => onVote(issue._id)}
              disabled={userHasVoted}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                userHasVoted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {userHasVoted ? '✓ Voted' : 'Vote'}
            </button>
          )}
          <button
            onClick={() => onViewDetails(issue._id)}
            className="px-3 py-1 rounded text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
