import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/api";
import HoldButton from "../components/HoldButton";
import Leaderboard from "../components/Leaderboard";
import UpgradeButton from "../components/UpgradeButton";
import ConvertToUser from "../components/ConvertToUser";
import Logout from "../components/Logout";
import Instructions from "../components/Instructions";
import { useAudio } from "../audio/useAudio";

export default function Game() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const audio = useAudio();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [lastCatch, setLastCatch] = useState(null);
  const [fishing, setFishing] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/game/profile");
        setUser(res.data.user);
      } catch (err) {
        if (import.meta.env.MODE === "development") {
          console.error("Failed to fetch profile:", err);
        }
        if (err.response?.status === 401) {
          logout();
          navigate("/");
        }
      }
    };

    fetchProfile();
  }, []);

  // Start ambient sounds when component mounts (after user interaction)
  useEffect(() => {
    // Delay slightly to ensure user has interacted
    const timer = setTimeout(() => {
      audio.playOcean();
      audio.playBGM();
    }, 500);

    return () => {
      clearTimeout(timer);
      audio.stopOcean();
      audio.stopBGM();
    };
  }, []);

  const handleLogout = () => {
    audio.stopOcean();
    audio.stopBGM();
    logout();
    navigate("/");
  };

  const handleUpgradeSuccess = (updatedData) => {
    audio.playClick();
    setUser((prev) => ({
      ...prev,
      gold: updatedData.gold,
      rodLevel: updatedData.rodLevel,
    }));
  };

  const fish = async (quality = "normal") => {
    if (fishing) return;

    try {
      setFishing(true);
      setLastCatch(null);
      
      // Play cast sound when fishing starts
      audio.playCast();
      
      const res = await api.post("/game/fish", { quality });

      if (res.data.success) {
        // Play success and coin sounds
        audio.playSuccess();
        setTimeout(() => audio.playCoin(), 300);
        
        setUser((prev) => ({
          ...prev,
          ...res.data.user,
        }));
        setLastCatch({
          type: "success",
          rarity: res.data.fish,
          reward: res.data.reward,
        });
      } else {
        setUser((prev) => ({
          ...prev,
          ...res.data.user,
        }));
        setLastCatch({
          type: "miss",
          message: res.data.message,
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
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold"
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
      <div className="w-[70%] h-full relative flex flex-col overflow-hidden">
        <div className="relative z-20 px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-xl shadow-lg">
                <span className="text-2xl">🎣</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Calm Waters
                </h1>
                {user && (
                  <p className="text-sm text-white/90 font-medium">
                    Welcome, {user.username || user.email}
                  </p>
                )}
              </div>
            </div>
            {user && (
              <Logout
                user={user}
                onLogout={handleLogout}
                onShowConvert={() => setShowConvertModal(true)}
              />
            )}
          </div>
        </div>

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background/background.png')" }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center">
            <HoldButton onSuccess={fish} disabled={fishing} audio={audio} />
          </div>
        </div>

        <div className="absolute bottom-[-80px] right-0 z-2 pointer-events-none">
          <img
            src="/rod.png"
            alt="Fishing Rod"
            className="w-[480px] h-auto object-contain"
            style={{ animation: "fishing-bob 3s infinite ease-in-out" }}
          />
        </div>

        {/* Instructions Icon */}
        <div className="absolute bottom-4 left-4 z-20">
          {showInstructions && (
            <div className="absolute bottom-12 left-0 mb-1">
              <Instructions />
            </div>
          )}

          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-2 rounded-full shadow-xl border-2 border-white/30"
            title="Instructions"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Last Catch Message */}
        {lastCatch && (
          <div className="absolute bottom-4 left-20 z-20 animate-fade-in">
            <div
              className={`backdrop-blur-xl rounded-xl px-4 py-3 shadow-2xl border-2 ${
                lastCatch.type === "success"
                  ? "bg-emerald-50/98 border-emerald-400"
                  : "bg-amber-50/98 border-amber-400"
              }`}
            >
              {lastCatch.type === "success" ? (
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🐟</div>
                  <div>
                    <p className="text-emerald-900 font-bold text-sm capitalize">
                      {lastCatch.rarity} Fish!
                    </p>
                    <div className="flex gap-2 text-xs text-emerald-800 font-semibold">
                      <span>💰 +{lastCatch.reward.gold}</span>
                      <span>⭐ +{lastCatch.reward.points}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-xl">😔</div>
                  <p className="text-amber-900 font-bold text-sm">
                    {lastCatch.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-[30%] h-full bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 border-l-4 border-teal-500 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-1 grid grid-rows-[auto_1fr] gap-4 p-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-teal-200">
              <h3 className="text-xs font-bold text-teal-900 mb-2 flex items-center gap-1.5 border-b border-teal-100 pb-1.5">
                Your Stats
              </h3>

              {user ? (
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-2 border border-yellow-300/50 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <div className="flex-1">
                        <p className="text-[9px] text-amber-600 font-semibold uppercase">
                          Gold
                        </p>
                        <p className="text-sm font-bold text-amber-900">
                          {user.gold.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-300/50 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      <div className="flex-1">
                        <p className="text-[9px] text-blue-600 font-semibold uppercase">
                          Points
                        </p>
                        <p className="text-sm font-bold text-blue-900">
                          {user.points.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-300/50 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎣</span>
                      <div className="flex-1">
                        <p className="text-[9px] text-emerald-600 font-semibold uppercase">
                          Rod Level
                        </p>
                        <p className="text-sm font-bold text-emerald-900">
                          Level {user.rodLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <div className="text-3xl mb-1.5 opacity-40">🎣</div>
                  <p className="font-semibold text-xs">Loading...</p>
                </div>
              )}
            </div>

            {user ? (
              <UpgradeButton
                user={user}
                onUpgradeSuccess={handleUpgradeSuccess}
              />
            ) : (
              <div className="text-center py-4 text-gray-400">
                <div className="text-3xl mb-1.5 opacity-40">🔧</div>
                <p className="font-semibold text-xs">Loading...</p>
              </div>
            )}
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-orange-200 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-orange-900 mb-2 flex items-center gap-1.5 border-b border-orange-100 pb-1.5">
              <span className="text-sm">🏆</span>
              Top Anglers
            </h3>
            <div className="flex-1 overflow-hidden">
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>

      {showConvertModal && user && (
        <ConvertToUser
          currentUser={user}
          onClose={() => setShowConvertModal(false)}
        />
      )}
    </div>
  );
}
