export default function Instructions() {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border-2 border-teal-400/50 w-64 animate-fade-in">
      {/* Instructions content */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎣</span>
          <h3 className="text-sm font-bold text-teal-700">How to Play</h3>
        </div>
        
        <p className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-1.5 rounded-lg">
          Stay in the GREEN ZONE!
        </p>
        
        <div className="space-y-1.5 text-[10px]">
          <div className="bg-green-50 border border-green-300 px-2 py-1.5 rounded-md flex items-center gap-1.5">
            <span>✋</span>
            <div>
              <strong className="text-green-700">Hold:</strong>
              <span className="text-green-600"> Increases tension</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-300 px-2 py-1.5 rounded-md flex items-center gap-1.5">
            <span>👋</span>
            <div>
              <strong className="text-blue-700">Release:</strong>
              <span className="text-blue-600"> Decreases tension</span>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-300 px-2 py-1.5 rounded-md flex items-center gap-1.5">
            <span>⏱️</span>
            <div>
              <strong className="text-purple-700">Goal:</strong>
              <span className="text-purple-600"> Stay 3s in zone</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-300 px-2 py-1.5 rounded-md">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">⚠️</span>
            <strong className="text-red-700 text-[10px]">Rules:</strong>
          </div>
          <div className="space-y-0.5 text-[9px] text-red-600">
            <p>❌ Max hold: 10s</p>
            <p>❌ Max release: 5s</p>
            <p>❌ Avoid red zone (90%+)</p>
            <p>✓ Keep alternating!</p>
          </div>
        </div>
      </div>
    </div>
  );
}