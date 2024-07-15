class WinScreen {
  constructor() {

  }
  update() {
    background(255, 255, 150);
    push();
    textSize(width / 16);
    textAlign(CENTER, CENTER);
    text("Wow you won congratuialatons", width / 2, height / 2);
    text("Press K to king", width / 2, height / 2 + width / 16);
    pop();
  }
  keyReleased(e) {
    if (e.keyCode == getKey("Exit")) setScene(mainMenu);
  }
}