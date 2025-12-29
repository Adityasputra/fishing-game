import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { io } from "socket.io-client";

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatingIds, setAnimatingIds] = useState(new Set());
  const socketRef = useRef(null);
  const isConnectingRef = useRef(false);
  const previousDataRef = useRef([]);

  useEffect(() => {
    // Prevent duplicate connections
    if (isConnectingRef.current || socketRef.current) return;
    isConnectingRef.current = true;

    // Get token from localStorage for authenticated socket
    const token = localStorage.getItem("token");

    // Create socket connection
    socketRef.current = io("http://localhost:3000", {
      auth: {
        token: token || undefined,
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
      // Detect new or updated entries for animation
      const newIds = new Set();
      leaderboardData.forEach((player) => {
        const previousPlayer = previousDataRef.current.find(
          (p) => p.id === player.id
        );
        if (!previousPlayer || previousPlayer.points !== player.points) {
          newIds.add(player.id);
        }
      });

      if (newIds.size > 0) {
        setAnimatingIds(newIds);
        setTimeout(() => setAnimatingIds(new Set()), 1000);
      }

      previousDataRef.current = leaderboardData;
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

  // Get current user ID for highlighting
  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch (err) {
      return null;
    }
  }, []);

  // Memoize medal colors
  const getMedalColor = useCallback((rank) => {
    const colors = {
      1: "from-yellow-400 to-yellow-600",
      2: "from-gray-300 to-gray-500",
      3: "from-amber-500 to-orange-600",
    };
    return colors[rank] || "";
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div className="relative inline-block">
          <div className="animate-spin text-2xl mb-2">⚓</div>
          <div className="absolute inset-0 animate-ping text-2xl mb-2 opacity-20">
            ⚓
          </div>
        </div>
        <p className="text-orange-600 text-xs font-medium animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div className="text-2xl mb-2 animate-bounce">⚠️</div>
        <p className="text-red-600 font-medium text-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-[10px] text-orange-600 hover:text-orange-700 font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-4 animate-fade-in">
        <div
          className="text-3xl mb-2 opacity-50 animate-bounce"
          style={{ animationDuration: "2s" }}
        >
          🏆
        </div>
        <p className="text-gray-600 font-semibold text-xs">No anglers yet</p>
        <p className="text-gray-400 text-[10px] mt-0.5">Be the first!</p>
      </div>
    );
  }

  // Leaderboard list
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 custom-scrollbar">
        {data.slice(0, 10).map((player, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          const isCurrentUser = player.id === currentUserId;
          const isAnimating = animatingIds.has(player.id);

          return (
            <div
              key={player.id || index}
              className={`
              flex items-center gap-2 p-2 rounded-lg transition-all duration-300
              ${isAnimating ? "animate-pulse scale-105" : ""}
              ${
                isCurrentUser
                  ? "bg-gradient-to-r from-teal-100 to-cyan-100 border border-teal-400 shadow-md"
                  : isTop3
                  ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 shadow-sm"
                  : "bg-white/60 border border-gray-200 hover:bg-white/80"
              }  
            `}
            >
              {/* Rank badge */}
              <div
                className={`
              flex items-center justify-center relative
              w-7 h-7 rounded-full font-bold text-xs flex-shrink-0
              transition-all duration-300
              ${
                isCurrentUser
                  ? "bg-gradient-to-br from-teal-400 to-cyan-600 text-white shadow-md"
                  : isTop3
                  ? `bg-gradient-to-br ${getMedalColor(
                      rank
                    )} text-white shadow-md`
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
              }
            `}
              >
                {rank <= 3 ? (
                  <span className="text-sm drop-shadow-md">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className="font-bold text-[10px]">#{rank}</span>
                )}
                {isAnimating && (
                  <div className="absolute inset-0 rounded-full bg-yellow-400/50 animate-ping"></div>
                )}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p
                    className={`
                  font-semibold truncate
                  ${
                    isCurrentUser
                      ? "text-teal-900 text-xs"
                      : isTop3
                      ? "text-orange-900 text-xs"
                      : "text-gray-700 text-[11px]"
                  }
                `}
                  >
                    {player.username}
                    {isCurrentUser && (
                      <span className="ml-1 text-[9px] bg-teal-600 text-white px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                </div>
                {/* Additional info - Rod Level */}
                {player.rodLevel && (
                  <p className="text-[9px] text-gray-500 mt-0.5 flex items-center gap-0.5">
                    <span className="text-[10px]">🎣</span>
                    <span>Lv {player.rodLevel}</span>
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-0.5">
                {/* Points */}
                <div
                  className={`
                flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[10px]
                transition-all duration-300
                ${
                  isCurrentUser
                    ? "bg-teal-200 text-teal-900 shadow-sm"
                    : isTop3
                    ? "bg-orange-200 text-orange-800"
                    : "bg-gray-100 text-gray-700"
                }
              `}
                >
                  <span
                    className={`text-xs ${isAnimating ? "animate-bounce" : ""}`}
                  >
                    ⭐
                  </span>
                  <span>{player.points.toLocaleString()}</span>
                </div>

                {/* Gold (if available) */}
                {player.gold !== undefined && (
                  <div className="flex items-center gap-0.5 text-[9px] text-amber-600 font-semibold">
                    <span className="text-[10px]">💰</span>
                    <span>{player.gold.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
