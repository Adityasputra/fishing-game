import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/api";
import HoldButton from "../components/HoldButton";
import Leaderboard from "../components/Leaderboard";
import UpgradeButton from "../components/UpgradeButton";

export default function Game() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [lastCatch, setLastCatch] = useState(null);
  const [fishing, setFishing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpgradeSuccess = (updatedData) => {
    setUser(prev => ({
      ...prev,
      gold: updatedData.gold,
      rodLevel: updatedData.rodLevel
    }));
  };

  const fish = async () => {
    if (fishing) return;
    
    try {
      setFishing(true);
      setLastCatch(null);
      const res = await api.post("/game/fish");
      
      if (res.data.success) {
        setUser(res.data.user);
        setLastCatch({
          type: "success",
          rarity: res.data.fish,
          reward: res.data.reward
        });
      } else {
        setUser(res.data.user);
        setLastCatch({
          type: "miss",
          message: res.data.message
        });
      }
      
      setTimeout(() => setLastCatch(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fish");
    } finally {
      setFishing(false);
    }
  };

  if (error) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-sky-200 to-teal-100 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">Oops!</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gradient-to-b from-sky-300 via-cyan-200 to-teal-300">
      
      {/* ===== LEFT SECTION - GAMEPLAY AREA (68%) ===== */}
      <div className="w-[68%] h-full relative flex flex-col">
        
        {/* Sky gradient with sun glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-200/40 via-sky-200/50 to-transparent pointer-events-none"></div>
        
        {/* Sun */}
        <div className="absolute top-16 right-16 w-24 h-24 bg-yellow-300 rounded-full blur-2xl opacity-60 animate-pulse"></div>
        
        {/* Water surface - animated */}
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-b from-cyan-400/70 to-teal-700/90 overflow-hidden">
          {/* Water waves animation */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-full h-32 bg-gradient-to-r from-transparent via-white to-transparent -skew-y-3 animate-pulse"></div>
          </div>
          {/* Water depth gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-teal-900/70 to-transparent"></div>
        </div>

        {/* Floating bubbles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/50 rounded-full blur-sm animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/40 rounded-full blur-sm animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-5 h-5 bg-white/30 rounded-full blur-sm animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/60 rounded-full blur-sm animate-ping" style={{ animationDelay: '1.5s' }}></div>

        {/* Welcome message overlay */}
        {!user && (
          <div className="relative z-10 mt-16 mx-auto animate-fade-in">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-10 py-5 shadow-2xl border-2 border-teal-300">
              <p className="text-teal-700 font-bold text-xl text-center">
                🎣 Hold the button below to cast your line!
              </p>
            </div>
          </div>
        )}

        {/* Catch result notification */}
        {lastCatch && (
          <div className="relative z-10 mt-16 mx-auto">
            <div className={`backdrop-blur-xl rounded-3xl px-10 py-7 shadow-2xl border-3 transform scale-110 transition-all ${
              lastCatch.type === "success" 
                ? "bg-emerald-100/95 border-emerald-500" 
                : "bg-amber-100/95 border-amber-500"
            }`}>
              {lastCatch.type === "success" ? (
                <div className="text-center">
                  <div className="text-6xl mb-3 animate-bounce">🐟</div>
                  <p className="text-emerald-900 font-bold text-2xl mb-3 capitalize">
                    {lastCatch.rarity} Fish Caught!
                  </p>
                  <div className="flex gap-6 justify-center text-emerald-800 text-lg font-semibold">
                    <span>💰 +{lastCatch.reward.gold}</span>
                    <span>⭐ +{lastCatch.reward.points}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-3">😔</div>
                  <p className="text-amber-900 font-bold text-xl">{lastCatch.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Central fishing interaction area */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center transform hover:scale-105 transition-transform">
            <HoldButton onSuccess={fish} disabled={fishing} />
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="relative z-10 pb-10 text-center">
          <div className="inline-block bg-teal-800/60 backdrop-blur-md px-8 py-3 rounded-full shadow-lg">
            <p className="text-white font-semibold text-base tracking-wide">
              {fishing ? "🎣 Line in the water..." : "🌊 Calm waters • Perfect for fishing"}
            </p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SECTION - PLAYER PANEL (32%) ===== */}
      <div className="w-[32%] h-full bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 border-l-4 border-teal-500 shadow-2xl overflow-y-auto">
        
        <div className="p-6 space-y-6">
          
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1"></div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🎣</span>
                <span>Angler's Hub</span>
              </h2>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all border border-white/30 hover:border-white/50 flex items-center gap-2"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Player Stats Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-teal-300">
            <h3 className="text-xl font-bold text-teal-800 mb-5 flex items-center gap-2 border-b-2 border-teal-200 pb-3">
              <span className="text-2xl">📊</span>
              <span>Your Progress</span>
            </h3>
            
            {user ? (
              <div className="space-y-4">
                {/* Gold */}
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-5 border-2 border-yellow-400 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">💰</span>
                    <div>
                      <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Gold</p>
                      <p className="text-2xl font-bold text-amber-800">{user.gold}</p>
                    </div>
                  </div>
                  <div className="text-amber-700 font-bold text-sm">COINS</div>
                </div>
                
                {/* Points */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-5 border-2 border-blue-400 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⭐</span>
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Points</p>
                      <p className="text-2xl font-bold text-blue-800">{user.points}</p>
                    </div>
                  </div>
                  <div className="text-blue-700 font-bold text-sm">XP</div>
                </div>
                
                {/* Rod Level */}
                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-5 border-2 border-emerald-400 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎣</span>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Rod Level</p>
                      <p className="text-2xl font-bold text-emerald-800">Level {user.rodLevel}</p>
                    </div>
                  </div>
                  <div className="text-emerald-700 font-bold text-sm">GEAR</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4 opacity-50">🎣</div>
                <p className="font-semibold text-lg">Start Fishing!</p>
                <p className="text-sm mt-2">Your stats will appear here</p>
              </div>
            )}
          </div>

          {/* Upgrades Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-300">
            <h3 className="text-xl font-bold text-purple-800 mb-5 flex items-center gap-2 border-b-2 border-purple-200 pb-3">
              <span className="text-2xl">⚡</span>
              <span>Upgrades</span>
            </h3>
            
            {user ? (
              <UpgradeButton user={user} onUpgradeSuccess={handleUpgradeSuccess} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4 opacity-50">🔧</div>
                <p className="font-semibold text-lg">Start Fishing!</p>
                <p className="text-sm mt-2">Upgrades will appear here</p>
              </div>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-orange-300">
            <h3 className="text-xl font-bold text-orange-800 mb-5 flex items-center gap-2 border-b-2 border-orange-200 pb-3">
              <span className="text-2xl">🏆</span>
              <span>Top Anglers</span>
            </h3>
            <Leaderboard />
          </div>

        </div>
      </div>
    </div>
  );
}
