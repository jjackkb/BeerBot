import { createBot } from 'mineflayer';
import { Vec3 } from 'vec3';

var direction = "south";

const yawValues = {
  east: -Math.PI / 2,
  north: 0,
  west: Math.PI / 2,
  south: Math.PI
};

const bot = createBot({
  host: 'localhost',
  port: 55052,
  username: 'BeerBot',
  version: '1.12.2'
});

// Functions

// Utility

async function findBlockFromOffset(x, y, z) {
  var count = 0;
  var block = bot.blockAt(new Vec3(bot.entity.position.x + x, bot.entity.position.y + y, bot.entity.position.z + z));
  while (block.name == 'air') {
    switch (direction) {
      case "east":
        block = bot.blockAt(new Vec3(bot.entity.position.x + x + count, bot.entity.position.y + y, bot.entity.position.z + z));
        break;
      case "west":
        block = bot.blockAt(new Vec3(bot.entity.position.x + x - count, bot.entity.position.y + y, bot.entity.position.z + z));
        break;
      case "north":
        block = bot.blockAt(new Vec3(bot.entity.position.x + x, bot.entity.position.y + y, bot.entity.position.z + z - count));
        break;
      case "south":
        block = bot.blockAt(new Vec3(bot.entity.position.x + x, bot.entity.position.y + y, bot.entity.position.z + z + count));
        break;
    }
    count = count + 1;
  }
  return block;
}

// Stage Checks

function mineInvCheck() {
  const pickaxe = bot.inventory.items().find(item => item.name === 'diamond_pickaxe');

  if (pickaxe) {
    moveToHand(pickaxe);
    return 1;
  } else {
    console.log("No pickaxe found!");
    return 0;
  }
}

// Bot controls

async function lineMine(length) {
  for (var i = 0; i < length; i++) {
    if (!mineInvCheck()) {
      bot.chat("I don't have a pickaxe!");
      return;
    }
    await bot.look(yawValues[direction], 0);

    var topBlock = await findBlockFromOffset(0, 1, 0);
    var bottomBlock = await findBlockFromOffset(0, 0, 0);

    while (true) {

      if (topBlock && bot.canDigBlock(topBlock)) {
        await mineBlock(topBlock);
      }

      if (bottomBlock && bot.canDigBlock(bottomBlock)) {
        await mineBlock(bottomBlock);
      }

      const topBlockNow = bot.blockAt(topBlock.position);
      const bottomBlockNow = bot.blockAt(bottomBlock.position);

      if (topBlockNow.name === "air" && bottomBlockNow.name === "air") {
        break;
      }

      if (topBlockNow.name !== "air") topBlock = topBlockNow;
      if (bottomBlockNow.name !== "air") bottomBlock = bottomBlockNow;
    }

    await walk(5);
  }
}

async function mineBlock(block) {
  if (bot.canDigBlock(block)) {
    await bot.dig(block);
    return true;
  } else {
    return false;
  }
}

async function walk(ticks) {
  bot.setControlState('forward', true);

  await bot.waitForTicks(ticks);

  bot.setControlState('forward', false);
}

async function moveToHand(item) {
  try {
    bot.equip(item, 'hand', (err) => {
      if (err) {
        console.error(`Failed to equip ${item}:`, err);
      } else {
        console.log(`${item} has been equipped to the main hand.`);
      }
    });
  } catch (err) {
    console.log("Couldn't find any item!");
  }
}

// Event listeners

bot.on('login', () => {
  console.log(`Logged in as ${bot.username}`);
});

bot.on('spawn', () => {
  console.log('Bot has spawned!');
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
      lineMine(message[3]);
    }
  }
});

bot.on('kicked', (reason, loggedIn) => {
  console.log(`Kicked: ${reason}`);
});
bot.on('error', (err) => {
  console.error(err);
});