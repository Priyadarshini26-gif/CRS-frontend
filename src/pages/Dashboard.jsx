import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';
import { getCategories } from '../utils/subcategories';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const categories = getCategories();

  const handleCategorySelect = (categoryId) => {
    navigate(`/complaint-form?category=${categoryId}`);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'local_authority':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">⚖️ Local Authority</span>;
      case 'govt_official':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">📋 Govt Official</span>;
      default:
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">👤 Citizen</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CityIssues Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Report, track, and resolve civic issues together</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user.name}</p>
              {getRoleBadge()}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Links - Enhanced */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/issues')}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-left"
          >
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-bold text-gray-900">View All Issues</p>
            <p className="text-sm text-gray-600 mt-2">Browse and search issues</p>
          </button>

          {user.role === 'user' && (
            <button
              onClick={() => navigate('/my-issues')}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <p className="text-3xl mb-3">📋</p>
              <p className="font-bold text-gray-900">My Reports</p>
              <p className="text-sm text-gray-600 mt-2">Track your issues</p>
            </button>
          )}

          {user.role === 'local_authority' && (
            <button
              onClick={() => navigate('/authority-dashboard')}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <p className="text-3xl mb-3">⚖️</p>
              <p className="font-bold text-gray-900">Authority Panel</p>
              <p className="text-sm text-gray-600 mt-2">Review & approve</p>
            </button>
          )}

          {user.role === 'govt_official' && (
            <button
              onClick={() => navigate('/govt-dashboard')}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <p className="text-3xl mb-3">🔧</p>
              <p className="font-bold text-gray-900">Official Panel</p>
              <p className="text-sm text-gray-600 mt-2">Manage resolutions</p>
            </button>
          )}
        </div>

        {/* Category Selection - Enhanced with better design */}
        {user.role === 'user' && (
          <div>
            <div className="mb-2">
              <h2 className="text-3xl font-bold text-gray-900">Report a New Issue</h2>
              <p className="text-gray-600 mt-2">Select a category that matches the problem you've found</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-8 text-white shadow-lg">
              <p className="text-lg font-semibold">💡 Pro Tip:</p>
              <p className="text-sm mt-1">Provide detailed information and location for faster resolution by authorities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, idx) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-xl hover:scale-105 transition-all text-center"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <p className="font-bold text-gray-900 text-lg">{category.name}</p>
                  <p className="text-xs text-gray-500 mt-3 group-hover:text-blue-600 font-semibold">Click to report →</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info for non-users */}
        {user.role !== 'user' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">👋 Welcome, {user.name}!</h2>
            <p className="text-gray-700 text-lg">
              {user.role === 'local_authority' 
                ? '🎯 You have access to the Authority Panel. Review pending issues and approve them for resolution by government officials.'
                : '🔧 You have access to the Official Panel. Manage and resolve issues assigned to you, and track resolution progress.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
