import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '../components/Map';
import { issuesAPI } from '../services/api';
import { getCategories, getSubcategoriesForCategory } from '../utils/subcategories';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategoryFromUrl = searchParams.get('category');
  
  const [categories, setCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(null);

  const [formData, setFormData] = useState({
    category: selectedCategoryFromUrl || '',
    subcategory: '',
    description: '',
    coordinates: null,
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [similarIssues, setSimilarIssues] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const allCats = getCategories();
    setCategories(allCats);
    
    // If a category is selected from URL, load its subcategories
    if (selectedCategoryFromUrl) {
      const categoryData = allCats.find(cat => cat.id === selectedCategoryFromUrl);
      if (categoryData) {
        setCategoryDetails(categoryData);
        const subs = getSubcategoriesForCategory(selectedCategoryFromUrl);
        setSubcategories(subs);
        setFormData(prev => ({
          ...prev,
          category: selectedCategoryFromUrl
        }));
      }
    } else {
      // Load all subcategories if no category is selected
      const allSubcategories = [];
      allCats.forEach(cat => {
        const subs = getSubcategoriesForCategory(cat.id);
        allSubcategories.push(...subs);
      });
      setSubcategories(allSubcategories);
    }
  }, [selectedCategoryFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      // When category changes, update subcategories
      const categoryData = categories.find(cat => cat.id === value);
      setCategoryDetails(categoryData);
      const subs = getSubcategoriesForCategory(value);
      setSubcategories(subs);
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: '' // Reset subcategory when category changes
      }));
    } else if (name === 'subcategory' && value) {
      // If subcategory is selected, ensure category is set (for fallback case)
      let selectedCategory = formData.category;
      if (!selectedCategory) {
        categories.forEach(cat => {
          const subs = getSubcategoriesForCategory(cat.id);
          if (subs.includes(value)) {
            selectedCategory = cat.id;
          }
        });
      }
      
      setFormData(prev => ({
        ...prev,
        subcategory: value,
        category: selectedCategory
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleLocationSelect = (coords) => {
    setFormData(prev => ({
      ...prev,
      coordinates: coords
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.category || !formData.subcategory || !formData.description || !formData.coordinates) {
      setError('Please fill all required fields and select a location');
      setLoading(false);
      return;
    }

    try {
      const response = await issuesAPI.createIssue({
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        coordinates: formData.coordinates,
        imageUrl: formData.imageUrl
      });

      setSuccess('Issue reported successfully!');
      
      // Check for similar issues
      if (response.data.similarIssues && response.data.similarIssues.found) {
        setSimilarIssues(response.data.similarIssues.issues);
        setShowSimilar(true);
      } else {
        setTimeout(() => {
          navigate('/my-issues');
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.hasDuplicate) {
        setError('You have already reported a similar issue in this area. Please view your existing issue or try a different location.');
      } else {
        setError(err.response?.data?.message || 'Failed to report issue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
            <p className="text-gray-600 text-sm mt-1">Help us improve your city by reporting civic issues</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {success && !showSimilar && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <p className="font-semibold">✅ {success}</p>
          </div>
        )}

        {showSimilar && similarIssues.length > 0 && (
          <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-blue-900 mb-4 text-lg">
              ℹ️ Similar Issues Found in This Area
            </h3>
            <p className="text-blue-800 mb-4">
              {similarIssues.length} similar issue(s) already reported nearby. Consider voting for existing issues instead:
            </p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {similarIssues.map(issue => (
                <button
                  key={issue._id}
                  onClick={() => navigate(`/issues/${issue._id}`)}
                  className="w-full text-left p-4 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all shadow-sm"
                >
                  <p className="font-semibold text-gray-900">{issue.subcategory}</p>
                  <p className="text-sm text-gray-600 mt-1">👍 {issue.votes} votes • {new Date(issue.createdAt).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/my-issues')}
              className="mt-4 w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-sm"
            >
              View Your Issues
            </button>
          </div>
        )}

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-gray-100">
          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
            <p className="text-gray-800 text-sm font-medium">
              <strong>💡 Tip:</strong> Select the issue type and provide details for better resolution. Be as specific as possible to help authorities respond faster.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Issue Details Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</span>
                Issue Details
              </h2>

              <div className="space-y-6">
                {/* Category Display/Selection */}
                {categoryDetails ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{categoryDetails.icon}</span>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Selected Category</p>
                          <p className="text-2xl font-bold text-gray-900">{categoryDetails.name}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Select Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Choose a category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subcategory Dropdown */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Subcategory * 
                    {categoryDetails && (
                      <span className="text-sm text-gray-500 font-normal ml-1">
                        ({subcategories.length} options)
                      </span>
                    )}
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    required
                    disabled={!formData.category}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.category ? 'Select a subcategory...' : 'Select a category first...'}
                    </option>
                    {subcategories.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Provide detailed information about the issue... What exactly is the problem? How long has it been there? Any safety concerns?"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</span>
                Location
              </h2>
              
              <div>
                <p className="text-gray-600 text-sm mb-3">Click on the map to place the marker, or drag it to adjust the exact location.</p>
                <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                  <Map onLocationSelect={handleLocationSelect} />
                </div>
                {formData.coordinates && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-800 font-semibold">
                      ✓ Location selected: [{formData.coordinates[0].toFixed(4)}, {formData.coordinates[1].toFixed(4)}]
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Section */}
            <div className="pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</span>
                Upload Evidence (Optional)
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                {formData.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 font-semibold mb-2">✓ Image uploaded</p>
                    <img src={formData.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg shadow-sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 shadow-md"
              >
                {loading ? 'Submitting...' : '✓ Submit Issue'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ComplaintForm;
