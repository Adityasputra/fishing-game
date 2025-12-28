import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api/api';

export default function Guest() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const guestLogin = async () => {
      try {
        const response = await api.post('/auth/guest');
        login(response.data.token);
        navigate('/game');
      } catch (err) {
        console.error('Guest login failed:', err);
        setError(err.response?.data?.message || 'Failed to login as guest. Please try again.');
      }
    };

    guestLogin();
  }, []);

  if (error) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-sky-200 via-teal-100 to-amber-50 flex items-center justify-center">
        <div className="max-w-md w-full px-8">
          <div className="bg-white/80 backdrop-blur-lg border-2 border-red-200/50 rounded-3xl p-10 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-700 mb-2">Login Failed</h1>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-sky-200 via-teal-100 to-amber-50 flex items-center justify-center overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-300/20 via-transparent to-sky-200/30"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-teal-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-40 h-40 bg-sky-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Loading content */}
      <div className="relative z-10 text-center">
        <div className="text-8xl mb-8 animate-bounce">🎣</div>
        <h1 className="text-4xl font-bold text-teal-800 mb-4">
          Preparing Your Journey...
        </h1>
        <p className="text-xl text-teal-600 mb-8">Setting up guest session</p>
        
        {/* Animated loading spinner */}
        <div className="flex justify-center">
          <svg className="animate-spin h-12 w-12 text-teal-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}