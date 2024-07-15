let scene;

let editor;
let winScreen;
let levelSelector;
let mainMenu;
let game;

let fps = 60;

let framesEvents = [];
let textButtons = [];
let buttons = [];
let hoveredButton;

let completedLevels;
let levelTimes;

let pressed = new Array(128).fill(false);
let pressedButtons = new Array(128).fill(false);
let controls = {
  "Move Left": 65,
  "Move Right": 68,
  "Move Up": 87,
  "Move Down": 83,
  "Restart": 82,
  "Kobojsarläge": 75,
  "Jump": 32,
  "Dash": 16,
  "Exit": 27,
};

let devMode = localStorage.getItem("devMode") || false;


let currentSkin;


function preload() {
  for (let i in textures) {
    textures[i] = loadImage(textures[i]);
  }
  for (let i in skins) {
    skins[i].pixels = loadImage("assets/images/player/skins/" + i + ".png");
  }
}
function nextSkin() {
  let keys = Object.keys(skins);
  let index = keys.indexOf(currentSkin);
  index = (index + 1) % keys.length;
  setPlayerSkin(keys[index]);

  let nSkin = skins[currentSkin];
  if (nSkin.unlock) {
    if (!nSkin.unlock()) nextSkin();
  }

  if (keys[index] == "base") nextSkin();
}
function setPlayerSkin(skinName) {
  let skin = skins[skinName].data;

  for (let textureIndex in textures) {
    let texture = textures[textureIndex];
    if (!textureIndex.includes("player")) continue;
    
    texture.loadPixels();
    let pix = texture.pixels;
    let ogPix = ogPixels[textureIndex];
    if (!ogPix) continue;

    for (let i = 0; i < pix.length; i += 4) {
      let colorIndex = skins.base.data.findIndex((e, idx) => {return e[0] == ogPix[i] && e[1] == ogPix[i+1] && e[2] == ogPix[i+2]});
      if (colorIndex == -1) continue;

      pix[i] = skin[colorIndex][0];
      pix[i+1] = skin[colorIndex][1];
      pix[i+2] = skin[colorIndex][2];
      pix[i+3] = skin[colorIndex][3];
    }

    texture.updatePixels();
  }

  currentSkin = skinName;
  localStorage.setItem("currentSkin", currentSkin);
}

function setup() {
  createCanvas(1, 1);
  windowResized();

  for (let i in textures) {
    textures[i].loadPixels();
    ogPixels[i] = JSON.parse(JSON.stringify(textures[i].pixels));
  }

  for (let skinIndex in skins) {
    let s = skins[skinIndex];
    s.pixels.loadPixels();
    s.pixels = s.pixels.pixels;
    s.data = new Array(s.pixels.length / 4);

    for (let i = 0; i < s.pixels.length; i += 4) {
      s.data[i / 4] = [
        s.pixels[i],
        s.pixels[i+1],
        s.pixels[i+2],
        s.pixels[i+3],
      ];
    }
  }
  
  setPlayerSkin(localStorage.getItem("currentSkin") || "green");

  completedLevels = localStorage.getItem("completedLevels") || 0;
  levelTimes = JSON.parse((localStorage.getItem("levelTimes") || "[]")).map(e => {return e ? parseFloat(e) : e});

  editor = new Editor();
  winScreen = new WinScreen();
  levelSelector = new LevelSelector();
  mainMenu = new MainMenu();
  game = new Game();
  
  setScene(mainMenu);
}
function windowResized() {
  let w = Math.min(windowWidth, windowHeight / 9 * 16);
  resizeCanvas(w, w / 16 * 9);
}

function setScene(newScene) {
  if (scene?.stop) scene.stop();
  scene = newScene;
  if (scene?.start) scene.start();
}


function getKey(controlName) {
  return controls[controlName];
}
function getKeyPressed(controlName) {
  return pressed[getKey(controlName)];
}
function getControlName(controlName) {
  return String.fromCharCode(controls[controlName]);
}


function keyPressed(e) {  
  pressed[e.keyCode] = true;

  if (devMode) print(e.keyCode);

  if (scene?.keyPressed) scene.keyPressed(e);
}
function keyReleased(e) {
  pressed[e.keyCode] = false;

  if (scene?.keyReleased) scene.keyReleased(e);
}

function mousePressed(e) {
  if (hoveredButton) { hoveredButton.callback(); return; }

  pressedButtons[e.button] = true;

  if (scene?.mousePressed) scene.mousePressed(e);
}
function mouseDragged(e) {
  if (scene?.mouseDragged) scene.mouseDragged(e);
}
function mouseReleased(e) {
  if (scene?.mouseReleased) scene.mouseReleased(e);

  pressedButtons[e.button] = false;
}
function mouseWheel(e) {
  if (scene?.mouseWheel) scene.mouseWheel(e);
}



function draw() {
  textFont("monospace");

  for (let i of animations) {
    textures[i.name] = textures[i.paths[Math.floor((frameCount / i.time / fps) % 1 * i.paths.length)]];
  }

  for (let i = 0; i < framesEvents.length; i++) {
    let event = framesEvents[i];
    if (event.frame == event.length) {
      framesEvents.splice(i, 1);
      i--;
      continue;
    }
    event.callback();
    event.frame = (event.frame || 0) + 1;
  }

  textButtons = [];
  buttons = [];

  if (scene?.update) scene.update();

  

  for (let i of textButtons) {
    push();

    noFill();
    stroke(i.c);
    strokeWeight(i.strokeWeight || 5);
    rect(i.x, i.y, i.w || (i.text.length / i.h * 2900), i.h * 0.82);

    fill(i.c);
    strokeWeight(1);
    textSize(i.h);
    textAlign(LEFT, TOP);
    text(i.text, i.x, i.y - 4);

    buttons.push({
      x: i.x, 
      y: i.y, 
      w: i.w || (i.text.length / i.h * 2900), 
      h: i.h * 0.82,
      callback: i.callback,
    });
    pop();
  }

  hoveredButton = undefined;
  for (let i of buttons) {
    if (mouseX > i.x && mouseX <= i.x + i.w && mouseY > i.y && mouseY <= i.y + i.h) {
      hoveredButton = i;
    }
  }
}



window.oncontextmenu = (e) => {
  e.preventDefault(); 
  e.stopPropagation(); 
  return false;
};