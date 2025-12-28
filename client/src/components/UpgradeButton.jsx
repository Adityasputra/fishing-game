import { useState } from 'react';
import api from '../api/api';

export default function UpgradeButton({ user, onUpgradeSuccess }) {
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');

  // Upgrade costs for each level
  const upgradeCosts = {
    1: 10,
    2: 25,
    3: 50,
    4: 100
  };

  const MAX_ROD_LEVEL = 5;
  const currentLevel = user?.rodLevel || 1;
  const upgradeCost = upgradeCosts[currentLevel];
  const canUpgrade = currentLevel < MAX_ROD_LEVEL;
  const hasEnoughGold = user && user.gold >= upgradeCost;

  const handleUpgrade = async () => {
    if (!canUpgrade) return;
    if (!hasEnoughGold) {
      setError(`Not enough gold! Need ${upgradeCost - user.gold} more`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setUpgrading(true);
    setError('');

    try {
      const response = await api.post('/game/upgrade');
      
      if (response.data.success) {
        // Call parent callback to update user state
        if (onUpgradeSuccess) {
          onUpgradeSuccess({
            gold: response.data.gold,
            rodLevel: response.data.rodLevel
          });
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Upgrade failed';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpgrading(false);
    }
  };

  if (!canUpgrade) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-5 border-2 border-gray-300">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <p className="font-bold text-gray-700 text-lg">Rod Maxed Out!</p>
            <p className="text-sm text-gray-600 mt-1">You have the best rod available</p>
          </div>
        </div>
        <div className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-3 px-6 rounded-xl text-center">
          Level {MAX_ROD_LEVEL} (MAX)
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-300 hover:border-purple-400 transition-all relative">
      {/* Error notification */}
      {error && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-10 whitespace-nowrap">
          {error}
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">🔧</div>
        <div className="flex-1">
          <p className="font-bold text-purple-900 text-lg">Upgrade Fishing Rod</p>
          <p className="text-sm text-purple-600 mt-1">
            Level {currentLevel} → {currentLevel + 1}
          </p>
          <p className="text-xs text-purple-500 mt-1">
            Catch rarer and more valuable fish
          </p>
        </div>
      </div>

      {/* Cost and Gold display */}
      <div className="flex items-center justify-between mb-4 bg-white/60 rounded-lg p-3">
        <div>
          <p className="text-xs text-purple-600 font-medium">COST</p>
          <p className="text-lg font-bold text-purple-900">💰 {upgradeCost}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-purple-600 font-medium">YOUR GOLD</p>
          <p className={`text-lg font-bold ${hasEnoughGold ? 'text-green-600' : 'text-red-600'}`}>
            💰 {user?.gold || 0}
          </p>
        </div>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={upgrading || !hasEnoughGold}
        className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-lg transform ${
          upgrading
            ? 'bg-gray-400 cursor-wait'
            : hasEnoughGold
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 text-white'
            : 'bg-gray-300 cursor-not-allowed text-gray-500'
        }`}
      >
        {upgrading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Upgrading...</span>
          </span>
        ) : hasEnoughGold ? (
          `Upgrade • ${upgradeCost} 💰`
        ) : (
          `Need ${upgradeCost - (user?.gold || 0)} more gold`
        )}
      </button>
    </div>
  );
}
