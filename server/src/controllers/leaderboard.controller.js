const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getLeaderboard = async (req, res) => {
  const leaderboard = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 50,
    select: {
      id: true,
      points: true,
      rodLevel: true
    }
  });

  res.json(leaderboard);
};
