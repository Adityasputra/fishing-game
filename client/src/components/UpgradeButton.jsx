import { useState, useMemo, useCallback } from "react";
import api from "../api/api";

export default function UpgradeButton({ user, onUpgradeSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_ROD_LEVEL = 5;

  const upgradeCosts = useMemo(
    () => ({
      1: 10,
      2: 25,
      3: 50,
      4: 100,
    }),
    []
  );

  const currentLevel = user?.rodLevel || 1;
  const upgradeCost = upgradeCosts[currentLevel];
  const canUpgrade = currentLevel < MAX_ROD_LEVEL;
  const hasEnoughGold = user?.gold >= upgradeCost;
  const goldNeeded = Math.max(0, upgradeCost - (user?.gold || 0));
  const progress = (currentLevel / MAX_ROD_LEVEL) * 100;

  const handleUpgrade = useCallback(async () => {
    if (!canUpgrade || !hasEnoughGold) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/game/upgrade");

      if (res.data.success && onUpgradeSuccess) {
        onUpgradeSuccess({
          gold: res.data.gold,
          rodLevel: res.data.rodLevel,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upgrade failed");
    } finally {
      setLoading(false);
    }
  }, [canUpgrade, hasEnoughGold, onUpgradeSuccess]);

  if (!canUpgrade) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-yellow-400 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div className="flex-1">
            <p className="font-bold text-yellow-800 text-sm">Maxed Out!</p>
            <p className="text-xs text-yellow-700">Level {MAX_ROD_LEVEL}</p>
          </div>
        </div>
        <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: '100%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">🔧</span>
        <div className="flex-1">
          <p className="font-bold text-purple-900 text-sm">Upgrade Rod</p>
          <div className="flex items-center gap-1 text-xs text-purple-700">
            <span className="inline-flex items-center justify-center w-4 h-4 bg-purple-200 rounded-full text-[9px] font-bold">{currentLevel}</span>
            <span className="text-purple-400">→</span>
            <span className="inline-flex items-center justify-center w-4 h-4 bg-purple-500 text-white rounded-full text-[9px] font-bold">{currentLevel + 1}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[9px] text-purple-600 font-semibold">Progress</span>
          <span className="text-[9px] text-purple-500">{currentLevel}/{MAX_ROD_LEVEL}</span>
        </div>
        <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Cost Display */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-orange-100 border border-orange-300 rounded-md p-2">
          <p className="text-[9px] text-orange-700 font-semibold uppercase">Cost</p>
          <p className="text-xs font-bold text-orange-900 flex items-center gap-0.5">
            <span>💰</span>
            <span>{upgradeCost}</span>
          </p>
        </div>
        <div className={`border rounded-md p-2 ${
          hasEnoughGold 
            ? 'bg-green-100 border-green-300' 
            : 'bg-red-100 border-red-300'
        }`}>
          <p className={`text-[9px] font-semibold uppercase ${
            hasEnoughGold ? 'text-green-700' : 'text-red-700'
          }`}>Your Gold</p>
          <p className={`text-xs font-bold flex items-center gap-0.5 ${
            hasEnoughGold ? 'text-green-900' : 'text-red-900'
          }`}>
            <span>💰</span>
            <span>{user?.gold || 0}</span>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-md p-2">
          <p className="text-[10px] text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Insufficient Gold Warning */}
      {!hasEnoughGold && !error && (
        <div className="bg-amber-50 border border-amber-300 rounded-md p-2">
          <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
            <span>⚠️</span>
            <span>Need {goldNeeded} more gold</span>
          </p>
        </div>
      )}

      {/* Upgrade Button */}
      <button
        onClick={handleUpgrade}
        disabled={loading || !hasEnoughGold}
        className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${
          loading
            ? 'bg-gray-400 text-white cursor-wait'
            : hasEnoughGold
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Upgrading...</span>
          </span>
        ) : hasEnoughGold ? (
          <span className="flex items-center justify-center gap-1.5">
            <span>⚡</span>
            <span>Upgrade Now</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>Insufficient Gold</span>
          </span>
        )}
      </button>
    </div>
  );
}
