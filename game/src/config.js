// Gobble Dash tuning: world size, stages, speeds and scoring in one place.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_TOP = 430;
export const GROUND_BOTTOM = 660;
export const GOAL_METERS = 1200;
export const TIME_LIMIT = 130;
export const START_LIVES = 3;

export const STAGES = [
  { name: "FARMYARD", from: 0, to: 400, farmerSpeed: 131, knifeEvery: 3.4, banner: "FARMYARD — outrun the farmer!" },
  { name: "BARN", from: 400, to: 800, farmerSpeed: 143, knifeEvery: 2.7, banner: "THE BARN — knives incoming!" },
  { name: "KITCHEN", from: 800, to: 1200, farmerSpeed: 155, knifeEvery: 2.2, banner: "KITCHEN — dodge the oven flames!" },
];

export function stageAt(meters) {
  for (const s of STAGES) if (meters >= s.from && meters < s.to) return s;
  return STAGES[STAGES.length - 1];
}

export const SCORE = { corn: 10, golden: 50, meter: 1, nearMiss: 15, winBonus: 250 };
