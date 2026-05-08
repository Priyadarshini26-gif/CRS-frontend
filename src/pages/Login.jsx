import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setAuth } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      setAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-500 to-cyan-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements - City/Civic themed */}
      <div className="absolute top-10 right-20 text-7xl opacity-20 animate-pulse">🏢</div>
      <div className="absolute top-32 right-40 text-6xl opacity-15 animate-bounce" style={{animationDuration: '3s'}}>🛣️</div>
      <div className="absolute bottom-20 left-10 text-7xl opacity-20 animate-pulse">🚦</div>
      <div className="absolute bottom-32 left-32 text-6xl opacity-15 animate-bounce" style={{animationDuration: '2.5s'}}>🔧</div>
      <div className="absolute top-1/2 right-10 text-6xl opacity-20 animate-pulse">💡</div>
      <div className="absolute top-1/4 left-20 text-5xl opacity-15 animate-bounce" style={{animationDuration: '3.5s'}}>🚗</div>
      <div className="absolute bottom-1/4 right-1/3 text-6xl opacity-20 animate-pulse">📍</div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏙️</div>
          <h1 className="text-4xl font-bold text-white mb-3">CityIssues</h1>
          <p className="text-lg text-teal-50 font-bold mb-3">A Community Driven Infrastructure Reporting & Prioritization Platform</p>
          <p className="text-xl text-teal-100 font-semibold">Report. Track. Improve Your City.</p>
          <p className="text-teal-100 text-sm mt-2">Empowering citizens to solve local problems faster</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="citizen@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 shadow-lg mt-2"
            >
              {loading ? '⏳ Logging in...' : '✓ Login'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              New here?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Create account →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
