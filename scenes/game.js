let keyPickupRange = 0.7;

let enterTime = 24;

let cameraSmoothing = 0.9;

let colors = [];
for (let i = 0; i < 8; i++) {
  colors.push(hsl2rgb(i / 8 * 360, 0.5, 0.5));
}
function hsl2rgb(h,s,l) {
   let a=s*Math.min(l,1-l);
   let f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0) * 255, f(8) * 255, f(4) * 255];
} 

class Game {
  constructor() {
    
  }
  setLevel(level) {
    this.level = level;
    this.world = level.world || new World(level.data);
    if (!this.cam) this.cam = new Vec(0, 0);

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
    this.particles = [];
    this.time = 0;
    framesEvents.push({length: enterTime + 1, callback: e => {this.enterState++;}});

    this.unlockWallJump = level.index >= unlockWallJump
    this.unlockDash = level.index >= unlockDash
  }

  keyPressed(e) {
    let p = this.world.player;

    if (e.keyCode == getKey("Jump") && this.enterState > enterTime) {
      p.inputJump();
    }
    if (e.keyCode == getKey("Dash") && this.enterState > enterTime && this.unlockDash) {
      p.inputDash();
    }
    if (e.keyCode == getKey("Restart")) {
      this.restart();
    }

    if (e.keyCode == getKey("Exit")) {
      if (this.level.index == 80085) { setScene(editor); return; }
      setScene(mainMenu);
    }

    if (e.keyCode == getKey("Kobojsarläge")) nextSkin();
  }
  keyReleased(e) {
    let p = this.world.player;

    if (e.keyCode == getKey("Jump")) {
      p.inputJumpEnd();
    }
  }

  update() {
    let world = game.world;
    let player = world.player;
    let size = width / 16;

    if (this.enterState > enterTime) {
      this.world.player.update();
      
      if (!world.key.pickedUp && (world.key.pos.x - player.pos.x) ** 2 + (world.key.pos.y - player.pos.y + playerH / 2) ** 2 < keyPickupRange ** 2) {
        world.key.pickedUp = true;
        framesEvents.push({length: 6, callback: e => {this.doorState ++}});
      }
      if (world.key.pickedUp && (world.door.pos.x - player.pos.x + 0.5) ** 2 + (world.door.pos.y - player.pos.y + 1) ** 2 < 0.5 ** 2) {
        if (this.level.index == 80085) { setScene(editor); editor.world.goldTime.time = this.time / fps; return; }
  
        if (completedLevels < this.level.index + 1) {
          completedLevels = this.level.index + 1;
          localStorage.setItem("completedLevels", completedLevels);
        }
        levelTimes[this.level.index] = Math.min(levelTimes[this.level.index] || 99999, this.time / fps);
        localStorage.setItem("levelTimes", JSON.stringify(levelTimes));
  
        if (this.level.index == levels.length - 1) {
          setScene(winScreen);
          return;
        }
  
        this.setLevel({data: levels[this.level.index + 1], index: this.level.index + 1});
        return;
      }

      this.cam.mul(cameraSmoothing);
      this.cam.addV(player.pos.copy().subV(new Vec(8, 6)).mul(1 - cameraSmoothing));
  
      this.cam.x = Math.max(this.cam.x, 0);
      this.cam.x = Math.min(this.cam.x, world.w - 16);
      this.cam.y = Math.max(this.cam.y, 0);
      this.cam.y = Math.min(this.cam.y, world.h - 9);

      this.time++;
    }

    this.updateParticles();

    this.render();
  }
  
  restart() {
    this.setLevel(this.level);
  }

  collideMoveVector(pos, vel) {
    let step = 0.005;
    let hit = false;

    for (let i = 0; i < Math.abs(vel.x); i += step) {
      if (Math.abs(vel.x) < 0.000001) break;

      pos.x += step * Math.sign(vel.x);

      let colls = this.doesCollide({x: pos.x, y: pos.y, z: 0, w: 0});
      if (colls.length == 0) continue;

      pos.x -= step * Math.sign(vel.x);
      vel.x *= -0.4;
      hit = true;
      break;
    }

    for (let i = 0; i < Math.abs(vel.y); i += step) {
      if (Math.abs(vel.y) < 0.000001) break;

      pos.y += step * Math.sign(vel.y);

      let colls = this.doesCollide({x: pos.x, y: pos.y, z: 0, w: 0});
      if (colls.length == 0) continue;

      pos.y -= step * Math.sign(vel.y);
      vel.y *= -0.4;
      hit = true;
      break;
    }

    return hit;
  }

  doesCollide(box) {
    let w = this.world;

    let pts = [[box.x, box.y], [box.x + box.z, box.y], [box.x, box.y + box.w], [box.x + box.z, box.y + box.w]];
    
    pts = pts.map((e, i) => {return {a: w.get(...e), i: i, pt: e}}).filter(e => {
      let block = e.a[0];
      if (block == 0) return false;

      if (blocks[block].hitbox == "circle") { return ((e.pt[0] % 1 - 0.5) ** 2 + (e.pt[1] % 1 - 0.5) ** 2 < 0.5 ** 2); }
      if (blocks[block].hitbox == "none") return false;

      return true;
    });

    pts = pts.map(e => {return {block: e.a, point: e.i}});

    return pts;
  }

  updateParticles() {
    let world = this.world;
    let player = world.player;

    let size = width / 16;

    if (frameCount % 7 == 0) {
      this.particles.push({
        pos: new Vec(Math.random() * 16 + this.cam.x, Math.random() * 9 + this.cam.y),
        size: 3 / size,
        time: 600,
        c: 200,
        rps: 0.2,
        vel: new Vec(Math.random() * 0.02 - 0.01, -0.02),

        gravity: 0.01,
      });
    }

    if (!world.key.pickedUp && frameCount % 7 == 0) {
      this.particles.push({
        pos: world.key.pos.copy(),
        size: 6  / size,
        time: 80,
        c: "#ffcc35",
        rps: 0.5,
        vel: new Vec(Math.random() * 0.02 - 0.01, Math.random() * 0.03 - 0.03),

        gravity: 0.1,

        physics: true,
      });
    }

    for (let x = 0; x < world.w; x++) {
      for (let y = 0; y < world.h; y++) {
        let block = world.g[x][y];
        if (!block[0]) continue;

        if (this.enterState > enterTime && blocks[block[0]].shoot) {
          let data = block[1];
          let a = data.a + data.rps * Math.PI * 2 * (scene == editor ? 0 : (this.time - 1)) / fps;

          let dir = new Vec(Math.cos(a), Math.sin(a));

          if ((this.time - 1) % Math.floor(fps / data.sps) == 0) {
            this.particles.push({
              pos: new Vec(x + 0.5, y + 0.5).addV(dir._mul(0.5)),
              size: 1 / 8,
              time: 6000,
              c: [255, 100, 100],
              rps: 0.2,
              vel: dir._div(30),
      
              gravity: 0,

              physics: "bullet",
            });
          }
        }
      }
    }

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.time--;
      p.rot = (p.rot || 0) + (p.rps || 0) / fps * Math.PI * 2;
      if (p.shrink) p.size -= p.shrink;

      if (p.vel) { 
        p.vel.addV(new Vec(0, gravity * p.gravity / fps));
         
        let hit = false;
        if (p.physics) hit = this.collideMoveVector(p.pos, p.vel);
        else p.pos.addV(p.vel);
        
        if (p.physics == "bullet") {
          if (hit) {
            this.particles.splice(i, 1);
            i--;
            continue;
          }

          if ((p.pos.x - player.pos.x) ** 2 + (p.pos.y - player.pos.y + playerH / 2) ** 2 < playerW ** 2) {
            this.restart();
          }

          if (frameCount % 7 == 0)
          this.particles.push({
            pos: p.pos.copy(),
            size: p.size,
            time: 20,
            shrink: 0.01,
            c: p.c,
            rps: p.rps + Math.random() * 1 - 0.5,
            vel: new Vec(0, 0),
  
            gravity: 0,
          });
        }
      }

      if (p.time == 0 || p.size < 0) { this.particles.splice(i, 1); i--; }
    }
  }

  render() {
    let world = this.world;
    let player = world.player;

    let size = width / 16;

    if (this.enterState > enterTime) background(this.theme[0]);
    else {
      this.noiseEffect();
    }

    for (let i of this.particles) {
      push();
      translate((i.pos.x - this.cam.x) * size, (i.pos.y - this.cam.y) * size);
      rotate(i.rot);
      noStroke();
      fill(i.c);
      rect(-i.size / 2 * size, -i.size / 2 * size, i.size * size, i.size * size);
      pop();
    }

    noStroke();
    fill(this.theme[1]);
    for (let x = 0; x < world.w; x++) {
      for (let y = 0; y < world.h; y++) {
        let block = world.g[x][y];
        if (!block[0]) continue;

        push();
        if (block[0] != 1) fill(this.theme[2]);
        blocks[block[0]].draw(new Vec((x - this.cam.x) * size, (y - this.cam.y) * size, size + 0.5, size + 0.5), block[1]);

        if (block[0] != 1) stroke(this.theme[2]);
        else stroke(this.theme[1]);
        noFill();
        if (blocks[block[0]].outline) rect((x - this.cam.x) * size, (y - this.cam.y) * size, size + 0.5, size + 0.5);
        pop();
      }
    }
    if (this.enterState <= enterTime) return;

    if (!world.key.pickedUp) image(textures["key1"], (world.key.pos.x - this.cam.x - 0.25) * size, (world.key.pos.y - this.cam.y - 0.25 + (Math.sin(frameCount / 10) / 20)) * size, size / 2, size / 2);

    image(textures["door" + this.doorState], (world.door.pos.x - this.cam.x) * size, (world.door.pos.y - this.cam.y) * size, size, size);

    push();
    textSize(size);
    textAlign(CENTER, CENTER);
    fill(this.theme[1]);
    text(world.text.text == "*" ? this.level.index : world.text.text, (world.text.pos.x - this.cam.x) * size, (world.text.pos.y - this.cam.y) * size);

    textAlign(RIGHT, TOP);
    textSize(size / 2);
    text(formatTime(this.time / fps), width, 0);
    fill(255, 255, 100);
    text(formatTime(this.world.goldTime.time), width, size / 2);
    pop();

    noSmooth();
    let texture = "idle";
    if (player.vel.x != 0) texture = "run";
    if (!player.grounded) texture = player.vel.y > 0 ? "fall" : "jump";
    if (player.walled) texture = "wall";

    if (player.vel.x < 0) player.lastDir = -1;
    if (player.vel.x > 0) player.lastDir = 1;

    push();
    translate((player.pos.x - this.cam.x - 0.5) * size, (player.pos.y - this.cam.y - 1) * size);
    scale(1 * Math.sign(player.lastDir), 1);
    image(textures["player/" + texture], 0, 0, size * Math.sign(player.lastDir), size);
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
}

function formatTime(t) {
  let s = (Math.floor(t * 10) / 10).toString();
  if (s.split(".").length == 1) s += ".0";
  return s;
}