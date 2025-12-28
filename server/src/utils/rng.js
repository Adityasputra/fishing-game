const rodChances = {
  1: { normal: 80, rare: 2, epic: 1 },
  2: { normal: 75, rare: 4, epic: 2 },
  3: { normal: 70, rare: 6, epic: 3 },
  4: { normal: 65, rare: 8, epic: 4 },
  5: { normal: 60, rare: 10, epic: 5 }
};

// Timing quality multipliers
const qualityBonus = {
  perfect: 1.5,  // 50% better odds for rare/epic
  good: 1.25,    // 25% better odds
  normal: 1.0    // No bonus
};

exports.getFish = (rodLevel, quality = 'normal') => {
  const chance = rodChances[rodLevel];
  const bonus = qualityBonus[quality] || 1.0;
  
  // Apply bonus to rare and epic chances
  const epicChance = chance.epic * bonus;
  const rareChance = chance.rare * bonus;
  
  const roll = Math.random() * 100;

  if (roll < epicChance) return "epic";
  if (roll < epicChance + rareChance) return "rare";
  if (roll < epicChance + rareChance + chance.normal) return "normal";

  return null;
};

