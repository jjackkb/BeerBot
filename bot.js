import { stripMine } from './mining.js';
import { pathfinder, Movements } from './movement.js';

import { createBot } from 'mineflayer';

export var direction = "south";

export const yawValues = {
  east: -Math.PI / 2,
  north: 0,
  west: Math.PI / 2,
  south: Math.PI
};

export const bot = createBot({
  host: 'localhost',
  port: 51921,
  username: 'BeerBot',
  version: '1.12.2'
});

export const defaultMove = new Movements(bot);

//// Event listeners
bot.on('login', () => {
  console.log(`Logged in as ${bot.username}`);
});

bot.on('spawn', () => {
  console.log('Bot has spawned!');
  bot.loadPlugin(pathfinder);
});

bot.on('entityHurt', (entity => {
  if (entity.username == bot.username) {
    bot.quit();
    console.log("Experienced damage! Disconnecting!");
  }
}));

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  console.log(`<${username}> ${message}`);
  message = message.split(" ");
  if (message[0] === 'bot') {
    if (message[1] === 'mine' && message.length == 4) {
      direction = message[2];
      stripMine(message[3]);
    }
  }
});

bot.on('kicked', (reason, loggedIn) => {
  console.log(`Kicked: ${reason}`);
});
bot.on('error', (err) => {
  console.error(err);
});