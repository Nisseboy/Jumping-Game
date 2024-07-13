let playerW = 6 / 16;
let playerH = 11 / 16;

let keyPickupRange = 0.7;

let playerSpeed = 7;

let playerJumpStrength = 12;
let graceTime = 1 / 10;
let coyoteTime = 1 / 10;

let wallJumpStrength = 4;
let wallJumpTime = 1 / 5;

let gravity = 0.6;
let maxFallSpeed = 0.3;

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
    framesEvents.push({length: enterTime + 1, callback: e => {this.enterState++;}});

    if (level.index >= unlockWallJump) this.unlockWallJump = true;
  }

  keyPressed(e) {
    let p = this.world.player;

    if (e.keyCode == getKey("Jump")) {
      p.graceTime = graceTime * fps;
    }
  }
  keyReleased(e) {
    let p = this.world.player;

    if (e.keyCode == getKey("Exit")) {
      if (this.level.index == 80085) { setScene(editor); return; }
      setScene(mainMenu);
    }

    if (e.keyCode == getKey("Jump") && p.inJump && p.vel.y < 0) {
      p.vel.y *= 0.5;
    }
  }

  update() {
    if (this.enterState > enterTime) {
      this.updatePlayer();
    }

    this.render();
  }
  
  restart() {
    this.setLevel(this.level);
  }

  updatePlayer() {
    let world = this.world;
    let player = world.player;

    let size = width / 16;

    if (player.graceTime && (player.grounded || player.walled)) {
      player.vel.y = -playerJumpStrength / fps;
      player.inJump = true;

      if (!player.grounded) {
        player.vel.x += wallJumpStrength / fps * -player.walled;
        if (player.walled) player.inWallJump = wallJumpTime * fps * player.walled;
      }

      player.graceTime = 0;
      player.grounded = 0;
    }


    let wallJumpFactor = (Math.abs(player.inWallJump) / wallJumpTime / fps);
    player.vel.x *= wallJumpFactor;
    
    if (getKeyPressed("Move Left") && !getKeyPressed("Move Right") && player.inWallJump >= 0) {
      player.vel.x = -playerSpeed / fps;
    }
    if (getKeyPressed("Move Right") && !getKeyPressed("Move Left") && player.inWallJump <= 0) {
      player.vel.x = playerSpeed / fps;
    }


    if (player.grounded) player.grounded--;
    if (player.inWallJump) player.inWallJump -= Math.sign(player.inWallJump);
    if (player.graceTime) player.graceTime--;


    let maxFallSpeed_ = maxFallSpeed;

    player.vel.y += gravity / fps;
    if (player.inJump && player.vel.y > 0) {
      player.vel.y += gravity / fps / 4;
    }
    if (player.walled) {
      maxFallSpeed_ = 0.05;
    }

    if (player.vel.y > maxFallSpeed_) {
      player.vel.y = maxFallSpeed_;
    }

    game.movePlayer();

    if (!world.key.pickedUp && (world.key.pos.x - player.pos.x) ** 2 + (world.key.pos.y - player.pos.y + playerH / 2) ** 2 < keyPickupRange ** 2) {
      world.key.pickedUp = true;
      framesEvents.push({length: 6, callback: e => {this.doorState ++}});
    }
    if (world.key.pickedUp && (world.door.pos.x - player.pos.x + 0.5) ** 2 + (world.door.pos.y - player.pos.y + 1) ** 2 < 0.5 ** 2) {
      if (this.level.index == 80085) { setScene(editor); return; }

      if (this.level.index == levels.length - 1) {
        setScene(winScreen);
        return;
      }

      if (completedLevels < this.level.index + 1) {
        completedLevels = this.level.index + 1;
        localStorage.setItem("completedLevels", completedLevels);
      }
      this.setLevel({data: levels[this.level.index + 1], index: this.level.index + 1});
      return;
    }

    this.cam.mul(cameraSmoothing);
    this.cam.addV(player.pos.copy().subV(new Vec(8, 6)).mul(1 - cameraSmoothing));

    this.cam.x = Math.max(this.cam.x, 0);
    this.cam.y = Math.max(this.cam.y, 0);
    this.cam.x = Math.min(this.cam.x, world.w - 16);
    this.cam.y = Math.min(this.cam.y, world.h - 9);
  }

  movePlayer() {
    let w = this.world;
    let p = w.player;

    let step = 0.01;

    p.walled = 0;

    for (let i = 0; i < Math.abs(p.vel.x); i += step) {
      p.pos.x += step * Math.sign(p.vel.x);

      let colls = this.doesCollide({x: p.pos.x - playerW / 2, y: p.pos.y - playerH, z: playerW, w: playerH});
      if (colls.length == 0) continue;

      let coll = colls[0];
      let block = coll.block;
      let point = coll.point;

      if (point == 0 || point == 2) {
        p.walled = -1;
      }
      else {
        p.walled = 1;
      }

      if (blocks[block[0]].hurt) {
        if (!colls[1] || blocks[colls[1].block[0]].hurt) this.restart();
      }

      p.pos.x -= step * Math.sign(p.vel.x);
      p.vel.x = 0;
      p.inJump = false;
      if (p.dash) p.dash = undefined;
      break;
    }

    for (let i = 0; i < Math.abs(p.vel.y); i += step) {
      p.pos.y += step * Math.sign(p.vel.y);

      let colls = this.doesCollide({x: p.pos.x - playerW / 2, y: p.pos.y - playerH, z: playerW, w: playerH});
      if (colls.length == 0) continue;

      let coll = colls[0];
      let block = coll.block;
      let point = coll.point;

      if (point == 2 || point == 3) {
        p.grounded = coyoteTime * fps;
        p.inJump = false;
      }

      if (blocks[block[0]].hurt) {
        if (!colls[1] || blocks[colls[1].block[0]].hurt) this.restart();
      };

      p.pos.y -= step * Math.sign(p.vel.y);
      p.vel.y = 0;

      break;
    }

    if (!this.unlockWallJump) p.walled = 0;
  }

  doesCollide(box) {
    let w = this.world;

    let tl = w.get(box.x, box.y);
    let tr = w.get(box.x + box.z, box.y);
    let bl = w.get(box.x, box.y + box.w);
    let br = w.get(box.x + box.z, box.y + box.w);

    let pts = [];
    if (tl[0]) pts.push( {block: tl, point: 0} );
    if (tr[0]) pts.push( {block: tr, point: 1} );
    if (bl[0]) pts.push( {block: bl, point: 2} );
    if (br[0]) pts.push( {block: br, point: 3} );

    return pts;
  }

  render() {
    let world = this.world;
    let player = world.player;

    let size = width / 16;

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
      }
    }
    if (this.enterState <= enterTime) return;

    if (!world.key.pickedUp) image(textures["key1"], (world.key.pos.x - this.cam.x - 0.25) * size, (world.key.pos.y - this.cam.y - 0.25) * size, size / 2, size / 2);

    image(textures["door" + this.doorState], (world.door.pos.x - this.cam.x) * size, (world.door.pos.y - this.cam.y) * size, size, size);


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