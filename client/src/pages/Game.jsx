import { useState } from "react";
import api from "../api/api";
import HoldButton from "../components/HoldButton";
import Leaderboard from "../components/Leaderboard";

export default function Game() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [lastCatch, setLastCatch] = useState(null);
  const [fishing, setFishing] = useState(false);

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
            <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
              <span className="text-4xl">🎣</span>
              <span>Angler's Hub</span>
            </h2>
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
            
            <div className="space-y-4">
              {/* Rod Upgrade */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-300 hover:border-purple-400 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">🔧</div>
                  <div className="flex-1">
                    <p className="font-bold text-purple-900 text-lg">Better Fishing Rod</p>
                    <p className="text-sm text-purple-600 mt-1">Catch rarer and more valuable fish</p>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Upgrade • 200 💰
                </button>
              </div>

              {/* Bait Upgrade */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-300 hover:border-green-400 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">🪱</div>
                  <div className="flex-1">
                    <p className="font-bold text-green-900 text-lg">Premium Bait</p>
                    <p className="text-sm text-green-600 mt-1">Attract fish faster</p>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Buy • 50 💰
                </button>
              </div>
            </div>
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
