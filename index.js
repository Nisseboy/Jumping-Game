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


let pressed = new Array(128).fill(false);
let pressedButtons = new Array(128).fill(false);
let controls = {
  "Move Left": 65,
  "Move Right": 68,
  "Move Up": 87,
  "Move Down": 83,
  "Restart": 82,
  "Jump": 32,
  "Dash": 16,
  "Exit": 27,
};

let devMode = localStorage.getItem("devMode") || false;

function preload() {
  for (let i in textures) {
    textures[i] = loadImage(textures[i]);
  }
}

function setup() {
  createCanvas(1, 1);
  windowResized();

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
    strokeWeight(5);
    rect(i.x, i.y, i.text.length / i.h * 2900, i.h * 0.82);

    fill(i.c);
    strokeWeight(1);
    textSize(i.h);
    textAlign(LEFT, TOP);
    text(i.text, i.x, i.y - 4);

    buttons.push({
      x: i.x, 
      y: i.y, 
      w: i.text.length / i.h * 2900, 
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