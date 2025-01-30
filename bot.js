import { createBot } from 'mineflayer';

var direction = "south";
var lineMine = false;
const yawValues = {
  east: -Math.PI / 2,
  north: 0,
  west: Math.PI / 2,
  south: Math.PI
};

const bot = createBot({
  host: '100.91.214.16',
  port: 25565,
  username: 'BeerBot',
  version: '1.12.2'
});

// Functions

// Utility

async function findMinableBlocks() {
  const blockVec = bot.findBlocks({
    matching: (block) => {
      return block.name !== 'air';
    },
    maxDistance: 6,
    count: 25
  });

  return blockVec || [];
}

async function checkBlockInLine(block, yLevel) {
  const botX = Math.floor(bot.entity.position.x);
  const botY = Math.floor(bot.entity.position.y);
  const botZ = Math.floor(bot.entity.position.z);

  const blockX = block.position.x;
  const blockY = block.position.y;
  const blockZ = block.position.z;

  if (direction == "west" && blockX <= botX && blockZ == botZ) {
    return (yLevel ? blockY === botY + 1 : blockY === botY);
  }
  if (direction == "east" && blockX >= botX && blockZ == botZ) {
    return (yLevel ? blockY === botY + 1 : blockY === botY);
  }
  if (direction == "north" && blockX == botX && blockZ <= botZ) {
    return (yLevel ? blockY === botY + 1 : blockY === botY);
  }
  if (direction == "south" && blockX == botX && blockZ >= botZ) {
    return (yLevel ? blockY === botY + 1 : blockY === botY);
  }

  return false;
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

async function mineLine(levelY) {
  if (lineMine == false)
    return;
  if (!mineInvCheck()) {
    bot.chat("Failed inventory check!"); return;
  }

  var block;
  const blocks = await findMinableBlocks();

  for (let i = 0; i < blocks.length; i++) {
    if (await checkBlockInLine(bot.blockAt(blocks[i]), levelY)) {
      block = bot.blockAt(blocks[i]);
      if (bot.canDigBlock(block)) {
        try {
          await bot.dig(block, true);
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  await walkForward();
  mineLine(!levelY);
}

async function walkForward() {
  await bot.look(yawValues[direction], 0);
  const dirVec = bot.blockAtCursor();
  bot.setControlState('forward', true);

  while (bot.entity.position.distanceTo(dirVec) > 0.5) {
    await bot.lookAt(dirVec);
    await bot.waitForTicks(4);
  }

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
  if (message === 'bot mine line') {
    lineMine = true;
    mineLine(true);
  }
  if (message === 'bot stop') {
    bot.look(yawValues[direction], 0);
    lineMine = false;
  }
});

bot.on('kicked', (reason, loggedIn) => {
  console.log(`Kicked: ${reason}`);
});
bot.on('error', (err) => {
  console.error(err);
});