const prisma = require("../config/db");
const { getFish } = require("../utils/rng");
const { upgradeCost } = require("../services/game.service");

const MAX_ROD_LEVEL = 5;
const MIN_ROD_LEVEL = 1;

const rewards = {
  normal: { gold: 2, points: 2 },
  rare: { gold: 5, points: 5 },
  epic: { gold: 10, points: 10 }
};

exports.fish = async (req, res) => {
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
        rodLevel: true,
        gold: true,
        points: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate rod level
    if (!user.rodLevel || user.rodLevel < MIN_ROD_LEVEL || user.rodLevel > MAX_ROD_LEVEL) {
      console.error(`Invalid rod level for user ${userId}: ${user.rodLevel}`);
      return res.status(400).json({ message: "Invalid rod level" });
    }

    const fish = getFish(user.rodLevel);
    
    // No catch this time
    if (!fish) {
      return res.json({ 
        success: false,
        message: "Fish escaped",
        user: {
          gold: user.gold,
          points: user.points,
          rodLevel: user.rodLevel
        }
      });
    }

    // Validate reward exists for caught fish
    const reward = rewards[fish];
    if (!reward) {
      console.error(`No reward defined for fish type: ${fish}`);
      return res.status(500).json({ message: "Invalid fish type" });
    }

    // Validate reward values
    if (typeof reward.gold !== 'number' || typeof reward.points !== 'number' || 
        reward.gold < 0 || reward.points < 0) {
      console.error(`Invalid reward values for ${fish}:`, reward);
      return res.status(500).json({ message: "Invalid reward configuration" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        gold: { increment: reward.gold },
        points: { increment: reward.points }
      },
      select: {
        id: true,
        gold: true,
        points: true,
        rodLevel: true
      }
    });

    res.json({ 
      success: true,
      fish, 
      reward, 
      user: updated 
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
        rodLevel: true
      }
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
        maxLevel: MAX_ROD_LEVEL
      });
    }

    const cost = upgradeCost[user.rodLevel];

    // Validate cost exists and is valid
    if (typeof cost !== 'number' || cost < 0) {
      console.error(`Invalid upgrade cost for level ${user.rodLevel}: ${cost}`);
      return res.status(500).json({ message: "Invalid upgrade cost configuration" });
    }

    if (user.gold < cost) {
      return res.status(400).json({
        message: "Not enough gold",
        required: cost,
        current: user.gold,
        needed: cost - user.gold
      });
    }

    // Use transaction to prevent race conditions
    const updated = await prisma.user.update({
      where: { 
        id: userId,
        gold: { gte: cost }, // Double-check gold is still sufficient
        rodLevel: user.rodLevel // Ensure level hasn't changed
      },
      data: {
        gold: { decrement: cost },
        rodLevel: { increment: 1 }
      },
      select: {
        id: true,
        gold: true,
        rodLevel: true
      }
    });

    res.json({
      success: true,
      message: "Rod upgraded successfully",
      rodLevel: updated.rodLevel,
      gold: updated.gold,
      costPaid: cost
    });
  } catch (err) {
    // Handle Prisma not found error (race condition)
    if (err.code === 'P2025') {
      return res.status(409).json({ 
        message: "Upgrade failed. Your gold or rod level may have changed. Please try again." 
      });
    }
    console.error("Rod upgrade error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
