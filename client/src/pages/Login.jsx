import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.token);
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-sky-200 via-teal-100 to-amber-50 flex items-center justify-center overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-300/20 via-transparent to-sky-200/30"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-teal-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-40 h-40 bg-sky-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </button>
          
          <div className="text-6xl mb-4">🎣</div>
          <h1 className="text-4xl font-bold text-teal-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-teal-600">Sign in to continue fishing</p>
        </div>

        {/* Login form */}
        <div className="bg-white/80 backdrop-blur-lg border-2 border-teal-200/50 rounded-3xl p-8 shadow-2xl shadow-teal-900/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-teal-700 font-semibold mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:border-teal-400 focus:outline-none transition-colors bg-white/50"
                placeholder="your@email.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-teal-700 font-semibold mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:border-teal-400 focus:outline-none transition-colors bg-white/50"
                placeholder="••••••••"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full font-semibold text-lg py-4 px-6 rounded-2xl 
                transition-all duration-300 transform shadow-lg
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/30'
                }
                text-white
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-teal-200"></div>
            <span className="text-teal-500 font-medium text-sm">or</span>
            <div className="flex-1 h-px bg-teal-200"></div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-teal-700 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-bold text-teal-600 hover:text-teal-700 underline transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-teal-600 mt-6 text-sm">
          🌊 Your fishing adventure awaits
        </p>
      </div>
    </div>
  );
}