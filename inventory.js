import { bot } from './bot.js';

export function invCheck(itemName) {
  const item = bot.inventory.items().find(item => item.name === itemName);

  if (item) {
    moveToHand(item);
  } else {
    bot.chat(`I need ${itemName}`);
    return false;
  }
  return true;
}

export function moveToHand(item) {
  bot.equip(item, 'hand', (err) => {
    if (err) {
      console.error(`Failed to equip ${item}`, err);
      return false;
    }
  })
  return true;
}