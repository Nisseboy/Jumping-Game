let camSpeed = 20;

class Editor {
  constructor() {
    this.currentBlock = 1;
  }
  setLevel(level) {
    this.level = level;
    this.world = level.world || new World(level.data);
    this.cam = new Vec(0, 0);

    this.theme = [];
    this.theme[0] = colors[Math.floor(Math.random() * colors.length)];
    do {
      this.theme[1] = colors[Math.floor(Math.random() * colors.length)];
    } while(this.theme[0] == this.theme[1])
    do {
      this.theme[2] = colors[Math.floor(Math.random() * colors.length)];
    } while(this.theme[0] == this.theme[2] || this.theme[1] == this.theme[2])

    this.doorState = 1;
    this.enterState = 0;
    framesEvents.push({length: enterTime + 1, callback: e => {this.enterState++;}});
  }

  start() {
    if (!this.world) {
      levelSelector.scene = editor; setScene(levelSelector);
    }
  }

  update() {
    let world = this.world;

    let size = width / 32;

    if (this.enterState > enterTime) {
      this.updateCam();
    }

    this.hovered = undefined;
    let m = new Vec(mouseX, mouseY).div(size).addV(this.cam);
    if (m._subV(world.key.pos).sqMag() < 0.5 ** 2) {
      this.hovered = world.key;
    }
    if (m._subV(world.player.pos._subV(new Vec(0, playerH / 2))).sqMag() < 0.5 ** 2) {
      this.hovered = world.player;
    }
    if (m._subV(world.door.pos._addV(new Vec(0.5, 0.5))).sqMag() < 0.5 ** 2) {
      this.hovered = world.door;
    }
    if (m._subV(world.text.pos).sqMag() < 0.5 ** 2) {
      this.hovered = world.text;
    }


    textButtons.push({
      text: "TEST",
      x: 20,
      y: 20,
      h: 71,
      c: "#4060bf",
      callback: e => {game.setLevel({data: this.world.export(), index: 80085}); setScene(game)}
    });
    textButtons.push({
      text: "EXPORT",
      x: 20,
      y: 90,
      h: 71,
      c: "#4060bf",
      callback: e => {console.log("/**/'" + this.world.export() + "',")}
    });



    this.render();
    
    let w = size;
    let x = 0;
    fill(this.theme[1]);
    for (let i = 0; i < blocks.length; i++) {
      if (i == 0) continue;
      let block = blocks[i];

      push();
      if (i == this.currentBlock) fill(255, 255, 0);
      block.draw(new Vec(x, height - w, w, w));
      pop();

      buttons.push({
        x: x,
        y: height - w,
        w: w,
        h: w,
        callback: e => {this.currentBlock = i}
      });

      x += w;
    }
  }

  mousePressed(e) {
    this.dragged = this.hovered;
    this.mouseDownPos = new Vec(mouseX, mouseY);
    this.mouseDragged(e);
  }
  mouseDragged(e) {
    let w = this.world;

    let size = width / 32;

    if (this.dragged) {
      let size = width / 32;
  
      this.dragged.pos.addV(new Vec(e.movementX / size, e.movementY / size));
    } else {
      let m = new Vec(mouseX, mouseY).div(size).addV(this.cam);
      m.x = Math.floor(m.x);
      m.y = Math.floor(m.y);

      if (pressedButtons[0]) {


        if (m.x >= w.w) w.addCol(m.x - w.w + 1);
        if (m.y >= w.h) w.addRow(m.y - w.h + 1);

        if (m.x < 0) {
          let d = -m.x;
          w.addCol(d);
          w.shiftX(d);

          w.player.pos.x += d;
          w.key.pos.x += d;
          w.door.pos.x += d;
          w.text.pos.x += d;

          this.cam.x += d;
        }
        if (m.y < 0) {
          let d = -m.y;
          w.addRow(d);
          w.shiftY(d);

          w.player.pos.y += d;
          w.key.pos.y += d;
          w.door.pos.y += d;
          w.text.pos.y += d;

          this.cam.y += d;
        }

        m = new Vec(mouseX, mouseY).div(size).addV(this.cam);
        m.x = Math.floor(m.x);
        m.y = Math.floor(m.y);
        w.g[m.x][m.y] = [this.currentBlock];
      }
      if (pressedButtons[2]) {
        if (m.x < 0 || m.x >= w.w || m.y < 0 || m.y >= w.h) return;

        w.g[m.x][m.y] = [0];
      }
    }
  }
  mouseReleased() {
    let world = this.world;

    if (this.dragged == world.text && this.mouseDownPos.x == mouseX && this.mouseDownPos.y == mouseY) {
      let n = prompt("New Text");
      if (n) world.text.text = n;
    }

    this.dragged = undefined;
  }

  updateCam() {
    if (getKeyPressed("Move Left")) {
      this.cam.x -= camSpeed / fps;
    }
    if (getKeyPressed("Move Right")) {
      this.cam.x += camSpeed / fps;
    }
    if (getKeyPressed("Move Up")) {
      this.cam.y -= camSpeed / fps;
    }
    if (getKeyPressed("Move Down")) {
      this.cam.y += camSpeed / fps;
    }
  }

  render() {
    push();
    let world = this.world;
    let player = world.player;

    let size = width / 32;

    if (this.enterState > enterTime) background(this.theme[0]);
    else {
      this.noiseEffect();
    }

    noStroke();
    fill(this.theme[1]);
    for (let x = 0; x < world.w; x++) {
      for (let y = 0; y < world.h; y++) {
        let block = world.g[x][y];
        if (block[0]) {
          push();
          if (block[0] == 2) fill(this.theme[2]);
          blocks[block[0]].draw(new Vec((x - this.cam.x) * size, (y - this.cam.y) * size, size + 0.5, size + 0.5), block[1]);
          pop();
        }
        
        push();
        noFill();
        stroke(0);
        rect((x - this.cam.x) * size, (y - this.cam.y) * size, size + 0.5, size + 0.5);
        pop();
      }
    }
    if (this.enterState <= enterTime) return;

    image(textures["key1"], (world.key.pos.x - this.cam.x - 0.25) * size, (world.key.pos.y - this.cam.y - 0.25) * size, size / 2, size / 2);
    image(textures["door" + this.doorState], (world.door.pos.x - this.cam.x) * size, (world.door.pos.y - this.cam.y) * size, size, size);

    push();
    textSize(size);
    textAlign(CENTER, CENTER);
    fill(this.theme[1]);
    text(world.text.text == "*" ? this.level.index : world.text.text, (world.text.pos.x - this.cam.x) * size, (world.text.pos.y - this.cam.y) * size);
    pop();

    noSmooth();
    image(textures["player/idle"], (player.pos.x - this.cam.x - 0.5) * size, (player.pos.y - this.cam.y - 1) * size, size * Math.sign(player.lastDir), size);

    let hovered = this.hovered;
    if (hovered) {
      let pos = hovered.pos;
      stroke(0, 255, 255);
      noFill();

      if (hovered == world.key) pos = pos._sub(0.5);
      if (hovered == world.player) pos = pos._subV(new Vec(0.5, 1));
      if (hovered == world.text) pos = pos._sub(0.5);

      rect((pos.x - this.cam.x) * size, (pos.y - this.cam.y) * size, size, size);
    }
    pop();
  }
  noiseEffect() {
    background(this.theme[1]);
    let img = createImage(160, 90);
    img.loadPixels();
    randomSeed(8675309);
    for (let i = 0; i < img.pixels.length; i += 4) {
      let c = (random(1) > (this.enterState / enterTime)) ? this.theme[1] : this.theme[0];
      img.pixels[i] = c[0];
      img.pixels[i+1] = c[1];
      img.pixels[i+2] = c[2];
      img.pixels[i+3] = 255;
    }
    img.updatePixels();

    noSmooth();
    image(img, 0, 0, width, height);
  }

  keyReleased(e) {
    if (e.keyCode == getKey("Exit")) setScene(mainMenu);
  }

  mouseWheel(e) {
    this.currentBlock += Math.sign(e.delta);
    this.currentBlock = Math.max(Math.min(this.currentBlock, blocks.length - 1), 1);
  }
}