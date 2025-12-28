const prisma = require("../config/db");

module.exports = async (io, socket) => {
  // Send initial leaderboard data on connection
  const sendLeaderboard = async () => {
    try {
      const topUsers = await prisma.user.findMany({
        where: {
          OR: [
            { isVerified: true },
            { isGuest: true }
          ]
        },
        orderBy: { points: "desc" },
        take: 10,
        select: {
          id: true,
          email: true,
          isGuest: true,
          points: true
        }
      });

      // Map email to username for frontend
      const leaderboard = topUsers.map(user => ({
        id: user.id,
        username: user.isGuest 
          ? `Guest-${user.id.slice(0, 6)}` 
          : (user.email || `User-${user.id.slice(0, 6)}`),
        points: user.points
      }));

      socket.emit("leaderboard:update", leaderboard);
    } catch (err) {
      console.error("Leaderboard error:", err);
      socket.emit("leaderboard:error", { message: "Failed to load leaderboard" });
    }
  };

  // Send initial data immediately
  await sendLeaderboard();

  // Handle manual refresh requests
  socket.on("leaderboard:get", sendLeaderboard);
};
