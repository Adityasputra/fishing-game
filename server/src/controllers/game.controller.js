const { PrismaClient } = require("@prisma/client");
const { getFish } = require("../utils/rng");

const prisma = new PrismaClient();

const rewards = {
  normal: { gold: 2, points: 2 },
  rare: { gold: 5, points: 5 },
  epic: { gold: 10, points: 10 }
};

exports.fish = async (req, res) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const fish = getFish(user.rodLevel);
  if (!fish) return res.json({ message: "Fish escaped" });

  const reward = rewards[fish];

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      gold: { increment: reward.gold },
      points: { increment: reward.points }
    }
  });

  res.json({ fish, reward, user: updated });
};
