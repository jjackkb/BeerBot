import { bot, defaultMove } from './bot.js';

import pathfinderPkg from 'mineflayer-pathfinder';

export const { pathfinder, Movements, goals } = pathfinderPkg;
export const { GoalNear } = goals;

export async function walk(vec, range = 0) {
  if (!vec) {
    return 1;
  }
  const goal = new GoalNear(vec.x, vec.y, vec.z, range);
  bot.pathfinder.setMovements(defaultMove);
  bot.pathfinder.setGoal(goal);
  await bot.pathfinder.goto(goal);
  return 0;
}