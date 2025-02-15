class LevelSelector {
  constructor() {

  }

  update() {
    background("#4060bf");

    let x = 20;
    let y = 20;

    let w = 100;
    for (let i = 0; i < levels.length; i++) {
      let time = levelTimes[i];

      push();
      strokeWeight(5);
      stroke(250, 250, 0);
      if (i > completedLevels) {
        fill(51, 51, 51);
      }
      if (i == completedLevels) {
        fill(0, 200, 200);
      }
      if (i < completedLevels) {
        let goldTime = (JSON.parse(levels[i]).goldTime?.time || 999) + 0.01;
        
        if (time) {
          if (time < goldTime) fill(255, 255, 100);
          else if (time - 1 < goldTime) fill(200, 200, 200);
          else fill(199, 123, 48);
        }
      }
      rect(x, y, w, w);
      pop();

      push();
      fill("#bf4040");
      textSize(40);
      textAlign(CENTER, CENTER);
      text(i, x + w / 2, y + w / 2);
      
      textSize(20);
      textAlign(CENTER, BOTTOM);
      fill(0);
      if (time) text(formatTime(time), x + w / 2, y + w);
      pop();

      if (i <= completedLevels || this.scene == editor) {
        buttons.push({x, y, w, h: w, callback: e => {this.scene.setLevel({data: levels[i], index: i}); setScene(this.scene)}});
      }

      x += w + 20;
      if (x > width - 20 - w) {
        x = 20;
        y += w + 20;
      }
    }

    if (this.scene == editor) {
      textButtons.push({
        x: 0,
        y: height - 70,
        h: 70,
        c: "#ff00ff",
        text: "FROM CLIPBOARD",

        callback: e => {
          navigator.clipboard.readText().then(e => {
            editor.setLevel({index: 80085, data: e});
            setScene(editor);
          });
        }
      });
    }
  }
  keyPressed(e) {
    if (e.keyCode == getKey("Exit")) setScene(mainMenu);
  }
}