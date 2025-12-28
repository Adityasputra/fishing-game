import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate connections
    if (isConnectingRef.current || socketRef.current) return;
    isConnectingRef.current = true;

    // Get token from localStorage for authenticated socket
    const token = localStorage.getItem("token");

    // Create socket connection
    socketRef.current = io("http://localhost:3000", {
      auth: {
        token: token || undefined
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Handle connection events
    socket.on("connect", () => {
      setError(null);
      setLoading(false);
    });

    socket.on("connect_error", (err) => {
      setError("Unable to connect");
      setLoading(false);
    });

    socket.on("disconnect", () => {
      setError("Connection lost");
    });

    // Handle leaderboard updates
    socket.on("leaderboard:update", (leaderboardData) => {
      setData(leaderboardData);
      setLoading(false);
      setError(null);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.off("leaderboard:update");
        socketRef.current.close();
        socketRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin text-4xl mb-3">⚓</div>
        <p className="text-orange-600 font-medium">Loading rankings...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-red-600 font-medium text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3 opacity-50">🏆</div>
        <p className="text-gray-500 font-medium">No anglers yet</p>
        <p className="text-gray-400 text-sm mt-1">Be the first to catch!</p>
      </div>
    );
  }

  // Leaderboard list
  return (
    <div className="space-y-2">
      {data.map((player, index) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;
        
        // Medal colors for top 3
        const medalColors = {
          1: "from-yellow-400 to-yellow-600",
          2: "from-gray-400 to-gray-600", 
          3: "from-orange-400 to-orange-600"
        };

        return (
          <div
            key={player.id || index}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all
              ${isTop3 
                ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-md hover:shadow-lg' 
                : 'bg-white/60 border border-gray-200 hover:bg-white/80'
              }
            `}
          >
            {/* Rank badge */}
            <div className={`
              flex items-center justify-center
              w-10 h-10 rounded-full font-bold text-sm flex-shrink-0
              ${isTop3 
                ? `bg-gradient-to-br ${medalColors[rank]} text-white shadow-lg` 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {rank <= 3 ? (
                <span className="text-lg">
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </span>
              ) : (
                <span>#{rank}</span>
              )}
            </div>

            {/* Player name */}
            <div className="flex-1 min-w-0">
              <p className={`
                font-semibold truncate
                ${isTop3 ? 'text-orange-900 text-base' : 'text-gray-700 text-sm'}
              `}>
                {player.username}
              </p>
            </div>

            {/* Points */}
            <div className={`
              flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm
              ${isTop3 
                ? 'bg-orange-200 text-orange-800' 
                : 'bg-gray-100 text-gray-700'
              }
            `}>
              <span>⭐</span>
              <span>{player.points}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
