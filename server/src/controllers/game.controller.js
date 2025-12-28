const prisma = require("../config/db");
const { getFish } = require("../utils/rng");
const { upgradeCost } = require("../services/game.service");

const MAX_ROD_LEVEL = 5;
const MIN_ROD_LEVEL = 1;

const rewards = {
  normal: { gold: 2, points: 2 },
  rare: { gold: 5, points: 5 },
  epic: { gold: 10, points: 10 },
};

exports.getProfile = async (req, res) => {
  try {
    // Validate authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        gold: true,
        points: true,
        rodLevel: true,
        isGuest: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.fish = async (req, res) => {
  try {
    // Validate authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    
    // Get timing quality from request body (perfect, good, normal)
    const { quality = 'normal' } = req.body;
    const validQualities = ['perfect', 'good', 'normal'];
    const timingQuality = validQualities.includes(quality) ? quality : 'normal';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        rodLevel: true,
        gold: true,
        points: true,
        isGuest: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate rod level
    if (
      !user.rodLevel ||
      user.rodLevel < MIN_ROD_LEVEL ||
      user.rodLevel > MAX_ROD_LEVEL
    ) {
      console.error(`Invalid rod level for user ${userId}: ${user.rodLevel}`);
      return res.status(400).json({ message: "Invalid rod level" });
    }

    const fish = getFish(user.rodLevel, timingQuality);

    // No catch this time
    if (!fish) {
      return res.json({
        success: false,
        message: "Fish escaped",
        user: {
          gold: user.gold,
          points: user.points,
          rodLevel: user.rodLevel,
          isGuest: user.isGuest,
        },
      });
    }

    // Validate reward exists for caught fish
    const reward = rewards[fish];
    if (!reward) {
      console.error(`No reward defined for fish type: ${fish}`);
      return res.status(500).json({ message: "Invalid fish type" });
    }

    // Validate reward values
    if (
      typeof reward.gold !== "number" ||
      typeof reward.points !== "number" ||
      reward.gold < 0 ||
      reward.points < 0
    ) {
      console.error(`Invalid reward values for ${fish}:`, reward);
      return res.status(500).json({ message: "Invalid reward configuration" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        gold: { increment: reward.gold },
        points: { increment: reward.points },
      },
      select: {
        id: true,
        gold: true,
        points: true,
        rodLevel: true,
        isGuest: true,
      },
    });

    const io = req.app.get("io");

    // Fetch and broadcast updated leaderboard
    const leaderboard = await prisma.user.findMany({
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
        username: true,
        points: true,
      },
    });

    // Format leaderboard for frontend
    const formattedLeaderboard = leaderboard.map(user => ({
      id: user.id,
      username: user.username || `User-${user.id.slice(0, 6)}`,
      points: user.points
    }));

    io.emit("leaderboard:update", formattedLeaderboard);

    res.json({
      success: true,
      fish,
      reward,
      user: updated,
    });
  } catch (err) {
    console.error("Fishing error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.upgradeRod = async (req, res) => {
  try {
    // Validate authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        gold: true,
        rodLevel: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate current rod level
    if (!user.rodLevel || user.rodLevel < MIN_ROD_LEVEL) {
      console.error(`Invalid rod level for user ${userId}: ${user.rodLevel}`);
      return res.status(400).json({ message: "Invalid rod level" });
    }

    if (user.rodLevel >= MAX_ROD_LEVEL) {
      return res.status(400).json({
        message: `Rod already at max level (${MAX_ROD_LEVEL})`,
        currentLevel: user.rodLevel,
        maxLevel: MAX_ROD_LEVEL,
      });
    }

    const cost = upgradeCost[user.rodLevel];

    // Validate cost exists and is valid
    if (typeof cost !== "number" || cost < 0) {
      console.error(`Invalid upgrade cost for level ${user.rodLevel}: ${cost}`);
      return res
        .status(500)
        .json({ message: "Invalid upgrade cost configuration" });
    }

    if (user.gold < cost) {
      return res.status(400).json({
        message: "Not enough gold",
        required: cost,
        current: user.gold,
        needed: cost - user.gold,
      });
    }

    // Use transaction to prevent race conditions
    const updated = await prisma.user.update({
      where: {
        id: userId,
        gold: { gte: cost }, // Double-check gold is still sufficient
        rodLevel: user.rodLevel, // Ensure level hasn't changed
      },
      data: {
        gold: { decrement: cost },
        rodLevel: { increment: 1 },
      },
      select: {
        id: true,
        gold: true,
        rodLevel: true,
      },
    });

    res.json({
      success: true,
      message: "Rod upgraded successfully",
      rodLevel: updated.rodLevel,
      gold: updated.gold,
      costPaid: cost,
    });
  } catch (err) {
    // Handle Prisma not found error (race condition)
    if (err.code === "P2025") {
      return res.status(409).json({
        message:
          "Upgrade failed. Your gold or rod level may have changed. Please try again.",
      });
    }
    console.error("Rod upgrade error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cast = async (req, res) => {
    try {
        // Validate authenticated user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;

        // Verify user exists and has valid rod level
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, rodLevel: true },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (
            !user.rodLevel ||
            user.rodLevel < MIN_ROD_LEVEL ||
            user.rodLevel > MAX_ROD_LEVEL
        ) {
            console.error(`Invalid rod level for user ${userId}: ${user.rodLevel}`);
            return res.status(400).json({ message: "Invalid rod level" });
        }

        // Check for existing active session
        const existingSession = await prisma.fishingSession.findFirst({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
        });

        if (existingSession) {
            return res.status(409).json({
                message: "Active fishing session already exists",
                biteAt: existingSession.biteAt,
            });
        }

        // Random delay (1–3 seconds)
        const delay = Math.random() * 2000 + 1000;
        const biteAt = new Date(Date.now() + delay);
        const expiresAt = new Date(biteAt.getTime() + 1500); // 1.5 second window

        await prisma.fishingSession.create({
            data: {
                userId,
                biteAt,
                expiresAt,
            },
        });

        res.json({
            message: "Line casted",
            biteAt,
            expiresAt,
        });
    } catch (err) {
        console.error("Cast error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.release = async (req, res) => {
    try {
        // Validate authenticated user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;

        const session = await prisma.fishingSession.findFirst({
            where: {
                userId,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!session) {
            return res.status(400).json({ message: "No active fishing session" });
        }

        const now = new Date();

        // Too early
        if (now < session.biteAt) {
            await prisma.fishingSession.delete({ where: { id: session.id } });
            return res.json({ success: false, message: "Too early" });
        }

        // Too late
        if (now > session.expiresAt) {
            await prisma.fishingSession.delete({ where: { id: session.id } });
            return res.json({ success: false, message: "Too late" });
        }

        // Perfect timing - catch fish
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                rodLevel: true,
                gold: true,
                points: true,
            },
        });

        if (!user) {
            await prisma.fishingSession.delete({ where: { id: session.id } });
            return res.status(404).json({ message: "User not found" });
        }

        // Validate rod level
        if (
            !user.rodLevel ||
            user.rodLevel < MIN_ROD_LEVEL ||
            user.rodLevel > MAX_ROD_LEVEL
        ) {
            console.error(`Invalid rod level for user ${userId}: ${user.rodLevel}`);
            await prisma.fishingSession.delete({ where: { id: session.id } });
            return res.status(400).json({ message: "Invalid rod level" });
        }

        const fish = getFish(user.rodLevel);

        // No catch this time
        if (!fish) {
            await prisma.fishingSession.delete({ where: { id: session.id } });
            return res.json({
                success: false,
                message: "Fish escaped",
                user: {
                    gold: user.gold,
                    points: user.points,
                    rodLevel: user.rodLevel,
                },
            });
        }

        // Validate reward exists
        const reward = rewards[fish];
        if (!reward) {
            console.error(`No reward defined for fish type: ${fish}`);
            await prisma.fishingSession.delete({ where: { id: session.id } });
            return res.status(500).json({ message: "Invalid fish type" });
        }

        // Validate reward values
        if (
            typeof reward.gold !== "number" ||
            typeof reward.points !== "number" ||
            reward.gold < 0 ||
            reward.points < 0
        ) {
            console.error(`Invalid reward values for ${fish}:`, reward);
            await prisma.fishingSession.delete({ where: { id: session.id } });
            return res.status(500).json({ message: "Invalid reward configuration" });
        }

        // Update user and delete session in transaction
        const [updated] = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    gold: { increment: reward.gold },
                    points: { increment: reward.points },
                },
                select: {
                    id: true,
                    gold: true,
                    points: true,
                    rodLevel: true,
                },
            }),
            prisma.fishingSession.delete({ where: { id: session.id } }),
        ]);

        // Update leaderboard
        const io = req.app.get("io");
        if (io) {
            const leaderboard = await prisma.user.findMany({
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
                    username: true,
                    points: true,
                },
            });

            // Format leaderboard for frontend
            const formattedLeaderboard = leaderboard.map(user => ({
                id: user.id,
                username: user.username || `User-${user.id.slice(0, 6)}`,
                points: user.points
            }));

            io.emit("leaderboard:update", formattedLeaderboard);
        }

        res.json({
            success: true,
            fish,
            reward,
            user: updated,
            message: "Nice catch!",
        });
    } catch (err) {
        console.error("Release error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
