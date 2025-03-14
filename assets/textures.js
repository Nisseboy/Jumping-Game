let folders = [
  "player/idle", "1,2",
  "player/run", "1,2",
  "player/fall", "1",
  "player/jump", "1",
  "player/wall", "1",

  "key", "1",
  "door", "1,2,3,4,5,6,7",
];

let animations = [
  {name: "player/idle", time: 0.5, paths: ["player/idle1", "player/idle2"]},
  {name: "player/run", time: 0.2, paths: ["player/run1", "player/run2"]},
  {name: "player/fall", time: 0.2, paths: ["player/fall1"]},
  {name: "player/jump", time: 0.2, paths: ["player/jump1"]},
  {name: "player/wall", time: 0.2, paths: ["player/wall1"]},
];

let skins = {
  base: {},
  green: {},
  cowboy: {},
  ninja: {unlock: () => completedLevels > 15},
  shrek: {unlock: () => completedLevels > 23},
  king: {unlock: () => completedLevels >= levels.length},
  kingking: {unlock: () => {let unlocked = true; for (let i = 0; i < levels.length; i++) {if ((levelTimes[i] || 999) >= (JSON.parse(levels[i]).goldTime?.time || 0) + 0.01) unlocked = false} return unlocked}},
};

let textures = {
  
}

let ogPixels = {};
for (let i = 0; i < folders.length; i += 2) {
  let path = folders[i];
  let names = folders[i + 1].split(",");
  for (let j of names) {
    textures[path + j] = `assets/images/${path}/${j}.png`;
  }
}


