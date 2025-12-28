import { useEffect, useState, useCallback, useRef } from "react";

export default function HoldButton({ onSuccess, disabled = false }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeInZone, setTimeInZone] = useState(0);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const gameActive = useRef(false);

  // Safe zone range (40-70%)
  const safeZoneStart = 40;
  const safeZoneEnd = 70;
  const dangerZone = 90; // Above this, fish escapes
  const timeNeeded = 3000; // Need to stay in zone for 3 seconds
  
  const isInSafeZone = progress >= safeZoneStart && progress <= safeZoneEnd;
  const isDanger = progress >= dangerZone;

  // Haptic feedback (vibration for mobile)
  const vibrate = useCallback((pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Play sound effect placeholder
  const playSound = useCallback((_type) => {
    // You can add actual audio files here
    // const audio = new Audio(`/sounds/${type}.mp3`);
    // audio.play();
  }, []);

  // Main game loop
  useEffect(() => {
    if (!gameActive.current) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        let newProgress = p;
        
        if (holding) {
          // Holding increases progress
          newProgress = p + 2;
        } else {
          // Releasing decreases progress
          newProgress = p - 1.5;
        }
        
        // Clamp between 0 and 100
        newProgress = Math.max(0, Math.min(100, newProgress));
        
        // Check if too high (fish escapes)
        if (newProgress >= dangerZone && !failed) {
          vibrate(300);
          playSound('fail');
          setFailed(true);
          gameActive.current = false;
          setTimeout(() => {
            setHasStarted(false);
            setProgress(0);
            setTimeInZone(0);
            setFailed(false);
          }, 2000);
        }
        
        return newProgress;
      });
      
      // Track time in safe zone
      setTimeInZone((t) => {
        if (!gameActive.current) return t;
        
        const inZone = progress >= safeZoneStart && progress <= safeZoneEnd;
        const newTime = inZone ? t + 100 : Math.max(0, t - 50);
        
        // Success! Stayed in zone long enough
        if (newTime >= timeNeeded && !success && !failed) {
          vibrate([100, 50, 100, 50, 100]);
          playSound('success');
          setSuccess(true);
          gameActive.current = false;
          
          // Determine quality based on consistency
          const quality = newTime >= timeNeeded + 1000 ? 'perfect' : newTime >= timeNeeded + 500 ? 'good' : 'normal';
          
          setTimeout(() => {
            onSuccess(quality);
            setHasStarted(false);
            setProgress(0);
            setTimeInZone(0);
            setSuccess(false);
          }, 1000);
        }
        
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [holding, progress, failed, success, onSuccess, vibrate, playSound, dangerZone, safeZoneStart, safeZoneEnd, timeNeeded]);

  const handleMouseDown = () => {
    if (!disabled && !gameActive.current) {
      // Start the game
      gameActive.current = true;
      setHasStarted(true);
      setProgress(50); // Start at middle
      vibrate(50);
      playSound('start');
    }
    setHolding(true);
  };

  const handleRelease = () => {
    setHolding(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 select-none">
      {/* Timer Bar - Shows time in safe zone */}
      {hasStarted && !failed && !success && (
        <div className="w-96 mb-2 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-white font-semibold text-xs px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-lg ${
              isInSafeZone ? 'bg-green-600/80' : 'bg-orange-600/80'
            }`}>
              <span>{isInSafeZone ? '✓' : '⏱️'}</span>
              <span>Time in Zone</span>
            </span>
            <span className={`text-white font-bold text-sm px-3 py-1 rounded-full backdrop-blur-sm transition-all shadow-lg ${
              isInSafeZone ? 'bg-green-600/90' : 'bg-orange-600/80'
            }`}>
              {(timeInZone / 1000).toFixed(1)}s / {(timeNeeded / 1000).toFixed(0)}s
            </span>
          </div>
          <div className="h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-white/30">
            <div 
              className={`h-full transition-all duration-200 ${
                isInSafeZone ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'
              }`}
              style={{ width: `${(timeInZone / timeNeeded) * 100}%` }}
            >
              {isInSafeZone && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hold Button */}
      <button
        className={`
          relative overflow-hidden
          text-white font-bold text-2xl
          px-20 py-10 rounded-3xl
          transition-all duration-200 transform
          shadow-2xl
          select-none cursor-pointer
          ${disabled || success || failed
            ? 'bg-gray-400 cursor-not-allowed opacity-60' 
            : isDanger
            ? 'bg-gradient-to-r from-red-600 to-red-700 scale-95 shadow-xl ring-4 ring-red-400/50 animate-pulse'
            : isInSafeZone
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 scale-95 shadow-xl ring-4 ring-green-400/50'
            : hasStarted
            ? 'bg-gradient-to-r from-orange-600 to-amber-600 scale-95 shadow-xl'
            : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:scale-105 hover:shadow-2xl hover:from-teal-400 hover:to-cyan-400 active:scale-95'
          }
        `}
        onMouseDown={handleMouseDown}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleRelease}
        disabled={disabled || success || failed}
      >
        {/* Animated background effect */}
        {hasStarted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        )}
        
        {/* Success/Fail indicator */}
        {(success || failed) && (
          <div className="absolute inset-0 flex items-center justify-center z-20 animate-fade-in">
            <div className={`text-white font-bold px-8 py-3 rounded-full shadow-2xl text-lg transform scale-110 ${
              success ? 'bg-green-500/95 animate-bounce' : 'bg-red-500/95'
            }`}>
              {success ? '🎣 FISH CAUGHT!' : '💨 FISH ESCAPED!'}
            </div>
          </div>
        )}
        
        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center gap-4">
          <span className={`text-5xl transition-transform ${
            isDanger ? 'animate-bounce scale-110' : holding ? 'scale-110' : ''
          }`}>
            🎣
          </span>
          <span>
            {!hasStarted ? 'Start Fishing!' : holding ? 'Holding...' : 'Released'}
          </span>
        </div>
      </button>
    
      {/* Progress Bar */}
      <div className="w-96">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold text-sm bg-teal-700/70 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
            🎣 Line Tension
          </span>
          <span className={`text-white font-bold text-lg px-5 py-1.5 rounded-full backdrop-blur-sm transition-all shadow-lg ${
            isDanger ? 'bg-red-600/90 animate-pulse scale-110 ring-2 ring-red-400' : 
            isInSafeZone ? 'bg-green-600/90 scale-105 ring-2 ring-green-400' : 
            'bg-orange-700/70'
          }`}>
            {Math.floor(progress)}%
          </span>
        </div>
        
        <div className="h-8 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border-2 border-white/40 relative">
          {/* Safe zone indicator */}
          <div 
            className="absolute h-full bg-green-400/40 border-l-2 border-r-2 border-green-500/70 z-10"
            style={{ 
              left: `${safeZoneStart}%`,
              width: `${safeZoneEnd - safeZoneStart}%`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/30 to-transparent animate-pulse"></div>
          </div>
          
          {/* Danger zone indicator */}
          <div 
            className="absolute h-full bg-red-400/40 border-l-4 border-red-500/90 z-10"
            style={{ 
              left: `${dangerZone}%`,
              width: `${100 - dangerZone}%`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/30 to-transparent animate-pulse"></div>
          </div>
          
          {/* Progress fill */}
          <div 
            className={`h-full transition-all duration-100 rounded-full shadow-lg relative z-20 ${
              isDanger 
                ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                : isInSafeZone
                ? 'bg-gradient-to-r from-green-400 via-green-300 to-emerald-400'
                : 'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400'
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
            
            {/* Glowing effect when in safe zone */}
            {isInSafeZone && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
            
              {/* Pointer at the end */}
              {progress > 0 && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 shadow-2xl transition-all ${
                  isDanger ? 'bg-red-300' : isInSafeZone ? 'bg-green-300' : 'bg-orange-300'
                }`}>
                  {isInSafeZone && (
                    <div className="absolute inset-0 bg-white animate-ping"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        {!hasStarted && (
          <div className="text-center space-y-3 animate-fade-in">
          <p className="text-white font-semibold text-base bg-teal-800/70 px-6 py-3 rounded-2xl backdrop-blur-sm shadow-lg">
            🎣 Balance the line tension - stay in the GREEN ZONE!
          </p>
          <div className="flex gap-4 text-xs text-white/70">
            <span className="bg-green-600/40 px-3 py-2 rounded-lg">
              ✓ <strong>Hold:</strong> Increases tension
            </span>
            <span className="bg-blue-600/40 px-3 py-2 rounded-lg">
              ↓ <strong>Release:</strong> Decreases tension
            </span>
            <span className="bg-red-600/40 px-3 py-2 rounded-lg">
              ⚠️ <strong>Too high:</strong> Fish escapes!
            </span>
          </div>
        </div>
      )}
      
      {/* Active fishing feedback */}
      {hasStarted && !success && !failed && (
        <div className="text-center animate-fade-in">
          <p className={`text-sm font-bold px-4 py-2 rounded-full backdrop-blur-sm shadow-lg ${
            isDanger 
              ? 'text-red-300 bg-red-900/60 animate-pulse' 
              : isInSafeZone 
              ? 'text-green-300 bg-green-900/60' 
              : 'text-orange-300 bg-orange-900/60'
          }`}>
            {isDanger 
              ? '🚨 DANGER! Release the button!' 
              : isInSafeZone 
              ? '✓ Perfect! Keep it steady...' 
              : progress < safeZoneStart
              ? '↑ Hold to increase tension'
              : '↓ Release to lower tension'}
          </p>
        </div>
      )}
    </div>
  );
}
