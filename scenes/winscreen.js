class WinScreen {
  constructor() {

  }
  update() {
    background(255, 255, 150);
    push();
    textSize(40);
    textAlign(CENTER, CENTER);
    text("Wow you won congratuialatons", width / 2, height / 2);
    pop();
  }
  keyReleased(e) {
    if (e.keyCode == getKey("Exit")) setScene(mainMenu);
  }
}