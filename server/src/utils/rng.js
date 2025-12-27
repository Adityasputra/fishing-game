const rodChances = {
  1: { normal: 80, rare: 2, epic: 1 },
  2: { normal: 75, rare: 4, epic: 2 },
  3: { normal: 70, rare: 6, epic: 3 },
  4: { normal: 65, rare: 8, epic: 4 },
  5: { normal: 60, rare: 10, epic: 5 }
};

exports.getFish = (rodLevel) => {
  const chance = rodChances[rodLevel];
  const roll = Math.random() * 100;

  if (roll < chance.epic) return "epic";
  if (roll < chance.epic + chance.rare) return "rare";
  if (roll < chance.epic + chance.rare + chance.normal) return "normal";

  return null; // ikan kabur
};

