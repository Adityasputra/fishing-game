exports.getFish = (rodLevel) => {
  const chances = [
    { type: "epic", chance: 1 + rodLevel },
    { type: "rare", chance: 2 + rodLevel * 2 },
    { type: "normal", chance: 80 - rodLevel * 5 }
  ];

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const fish of chances) {
    cumulative += fish.chance;
    if (roll <= cumulative) return fish.type;
  }

  return null;
};
