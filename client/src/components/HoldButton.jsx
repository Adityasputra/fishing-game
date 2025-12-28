import { useEffect, useState } from "react";

export default function HoldButton({ onSuccess, disabled = false }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!holding) {
      // Reset progress smoothly when released early
      if (progress > 0 && progress < 100) {
        const resetInterval = setInterval(() => {
          setProgress((p) => {
            if (p <= 0) {
              clearInterval(resetInterval);
              return 0;
            }
            return p - 5;
          });
        }, 50);
        return () => clearInterval(resetInterval);
      }
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          onSuccess();
          return 0;
        }
        return p + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [holding, progress, onSuccess]);

  const handleMouseDown = () => {
    if (!disabled) setHolding(true);
  };

  const handleRelease = () => {
    setHolding(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hold Button */}
      <button
        className={`
          relative overflow-hidden
          text-white font-bold text-2xl
          px-16 py-8 rounded-3xl
          transition-all duration-300 transform
          shadow-2xl
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed opacity-60' 
            : holding 
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 scale-95 shadow-xl' 
              : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:scale-105 hover:shadow-2xl hover:from-teal-400 hover:to-cyan-400'
          }
        `}
        onMouseDown={handleMouseDown}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleRelease}
        disabled={disabled}
      >
        {/* Progress overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-30 transition-all duration-100"
          style={{ 
            width: `${progress}%`,
            left: 0
          }}
        ></div>
        
        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          <span className="text-4xl">🎣</span>
          <span>
            {disabled ? 'FISHING...' : holding ? 'CASTING...' : 'HOLD TO CAST'}
          </span>
        </div>
      </button>

      {/* Progress bar */}
      <div className="w-80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold text-sm bg-teal-700/70 px-3 py-1 rounded-full backdrop-blur-sm">
            Casting Power
          </span>
          <span className="text-white font-bold text-lg bg-teal-700/70 px-4 py-1 rounded-full backdrop-blur-sm">
            {Math.floor(progress)}%
          </span>
        </div>
        
        <div className="h-6 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border-2 border-white/40">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-100 rounded-full shadow-lg relative"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Helper text */}
      {!disabled && !holding && progress === 0 && (
        <p className="text-white/80 text-sm font-medium bg-teal-800/60 px-4 py-2 rounded-full backdrop-blur-sm">
          💡 Hold button until 100% to cast your line
        </p>
      )}
    </div>
  );
}
