import { bot, yawValues, direction } from './bot.js';
import { walk } from './movement.js';
import { invCheck } from './inventory.js';

import { Vec3 } from 'vec3';

var yLevel;
var xPos;
var zPos;

async function findBlockFromOffset(x, y, z) {
  let count = 0;
  let maxReach = bot.entity.interactionRange || 4.5;
  let block;

  do {
    let newX = bot.entity.position.x + x;
    let newY = bot.entity.position.y + y;
    let newZ = bot.entity.position.z + z;

    switch (direction) {
      case "east":
        newX += count;
        break;
      case "west":
        newX -= count;
        break;
      case "north":
        newZ -= count;
        break;
      case "south":
        newZ += count;
        break;
    }

    block = bot.blockAt(new Vec3(newX, newY, newZ));
    count++;
  } while (block.name === 'air' && count <= maxReach);

  return block;
}

export async function stripMine(length, yLevel = bot.entity.position.y.toFixed(0), linePos) {
  if (invCheck("diamond_pickaxe")) {
    if (!linePos) {
      if (direction === "north" || direction === "south")
        linePos = bot.entity.position.x.toFixed(0);
      else {
        linePos = bot.entity.position.z.toFixed(0);
      }
    }

    var goal;

    for (var i = 0; i < length; i++) {
      if (direction === "north" || direction === "south") {
        if (bot.entity.position.x.toFixed(0) != linePos || bot.entity.position.y.toFixed(0) != yLevel) {
          goal = new Vec3(linePos, yLevel, bot.entity.position.z);
          await walk(goal, 0);
          invCheck("diamond_pickaxe");
        }
      }
      else {
        if (bot.entity.position.z.toFixed(0) != linePos || bot.entity.position.y.toFixed(0) != yLevel) {
          goal = new Vec3(bot.entity.position.x, yLevel, linePos);
          await walk(goal, 0);
          invCheck("diamond_pickaxe");
        }
      }

      await bot.look(yawValues[direction], 0, true);

      var bottomBlock = await findBlockFromOffset(0, 0, 0);
      let topBlock = bot.blockAt(new Vec3(bottomBlock.position.x, bottomBlock.position.y + 1, bottomBlock.position.z));

      while (true) {
        topBlock = bot.blockAt(new Vec3(bottomBlock.position.x, bottomBlock.position.y + 1, bottomBlock.position.z));

        await mineBlock(bottomBlock);
        await mineBlock(topBlock);

        bottomBlock = bot.blockAt(bottomBlock.position);
        topBlock = bot.blockAt(topBlock.position);

        if (bottomBlock.name === 'air' || topBlock.name === 'air') break;
      }

      await walk(topBlock.position, 2);
      invCheck("diamond_pickaxe");
    }
    bot.chat(`Finished mining ${length} blocks ${direction}`);
  }
}

async function mineBlock(block) {
  if (block.name != 'air' && bot.canDigBlock(block)) {
    await bot.dig(block);
    return 0;
  } else {
    return 1;
  }
}