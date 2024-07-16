let playerW = 6 / 16;
let playerH = 11 / 16;

let playerSpeed = 7;

let playerJumpStrength = 12;
let graceTime = 1 / 10;
let coyoteTime = 1 / 10;

let playerDashTime = 0.25;
let playerDashSpeed = 20;
let dashGraceTime = 1 / 10;
let dashCooldown = 0.5;

let wallJumpStrength = 4;
let wallJumpTime = 1 / 5;

let gravity = 0.6;
let maxFallSpeed = 0.3;

let bounceFactor = 0.9;

class Player {
  
  constructor(pos) {
    this.pos = new Vec().from(pos);
    this.vel = new Vec(0, 0);
    this.grounded = 0;
    this.graceTime = 0;
    this.walled = 0;
    
    this.inJump = false;
    this.inWallJump = 0;

    this.lastDir = 1;

    this.dashGrace = 0;
    this.dash = 0;
    this.dashCooldown = 0;
  }

  inputJump() {
    this.graceTime = graceTime * fps;
  }
  inputJumpEnd() {
    if (this.inJump && this.vel.y < 0) {
      this.vel.y *= 0.5;
    }
  }
  inputDash() {
    this.dashGraceTime = dashGraceTime * fps;
  }

  update() {
    let size = width / 16;

    if (this.graceTime && (this.grounded || this.walled)) {
      this.vel.y = -playerJumpStrength / fps;
      this.inJump = true;

      if (!this.grounded) {
        this.vel.x += wallJumpStrength / fps * -this.walled;
        if (this.walled) this.inWallJump = wallJumpTime * fps * this.walled;
      }

      this.graceTime = 0;
      this.grounded = 0;
    }


    let wallJumpFactor = (Math.abs(this.inWallJump) / wallJumpTime / fps);
    this.vel.x *= wallJumpFactor;
    
    let movement = getKeyPressed("Move Right") - getKeyPressed("Move Left");

    if (movement < 0 && this.inWallJump >= 0) {
      this.vel.x = -playerSpeed / fps;
    }
    if (movement > 0 && this.inWallJump <= 0) {
      this.vel.x = playerSpeed / fps;
    }


    if (this.dashGraceTime && !this.dashCooldown) {
      this.dash = playerDashTime * fps * movement;

      this.dashCooldown = dashCooldown * fps;
      this.dashGraceTime = 0;
    }
    if (this.dash) {
      this.vel.x = Math.sign(this.dash) * playerDashSpeed / fps;
    }


    if (this.grounded) this.grounded--;
    if (this.inWallJump) this.inWallJump -= Math.sign(this.inWallJump);
    if (this.graceTime) this.graceTime--;

    if (this.dashGraceTime) this.dashGraceTime--;
    if (this.dashCooldown) this.dashCooldown--;
    if (this.dash) this.dash -= Math.sign(this.dash);


    let maxFallSpeed_ = maxFallSpeed;

    this.vel.y += gravity / fps;
    if (this.inJump && this.vel.y > 0) {
      this.vel.y += gravity / fps / 4;
    }
    if (this.walled) {
      maxFallSpeed_ = 0.05;
    }

    if (this.vel.y > maxFallSpeed_) {
      this.vel.y = maxFallSpeed_;
    }

    if (this.dash) { this.vel.y = 0; }


    this.move();


    if (this.vel.x != 0 && this.grounded && frameCount % 3 == 0) {
      game.particles.push({
        pos: this.pos.copy(),
        size: 6 / size,
        time: 80,
        c: game.theme[1],
        rps: 0.5,
        vel: new Vec(Math.random() * 0.02 - 0.01, Math.random() * 0.04 - 0.04),

        gravity: 0.1,

        physics: true,
      });
    }

    if (this.dash) {
      for (let i = 0; i < 10; i++) {
        game.particles.push({
          pos: this.pos._subV(new Vec(0, playerH * i / 10)),
          size: 6 / size,
          time: 80,
          c: 255,
          rps: 0.5,
          vel: new Vec(Math.random() * 0.02 - 0.01, Math.random() * 0.04 - 0.04),

          gravity: 0.1,

          physics: true,
        });
      }
    }
  }

  move() {
    let w = game.world;
    let p = this;

    function allPointsHave(colls, prop) {
      let have = true;
      for (let i of colls) {
        if (!blocks[i.block[0]][prop]) have = false;
      }
      return have;
    }

    p.walled = 0;

    let step = 0.005;
    let i = Math.abs(p.vel.x);
    while (i > 0) {
      i -= step;
      if (i < 0) {
        step += i;
        i = 0;
      }
      p.pos.x += step * Math.sign(p.vel.x);

      let colls = this.doesCollide();
      if (colls.length == 0) continue;

      let coll = colls[0];
      let block = coll.block;
      let point = coll.point;

      if (allPointsHave(colls, "bounce")) {
        p.pos.x -= step * Math.sign(p.vel.x);
        p.vel.x *= -bounceFactor;
        p.dash *= -1;
        continue;
      }

      if (point == 0 || point == 2) {
        p.walled = -1;
      }
      else {
        p.walled = 1;
      }

      if (allPointsHave(colls, "hurt")) {
        game.restart();
      }

      p.pos.x -= step * Math.sign(p.vel.x);
      p.vel.x = 0;
      if (game.unlockWallJump) p.inJump = false;
      if (p.dash) p.dash = undefined;
      break;
    }

    step = 0.005;
    i = Math.abs(p.vel.y);
    while (i > 0) {
      i -= step;
      if (i < 0) {
        step += i;
        i = 0;
      }
      p.pos.y += step * Math.sign(p.vel.y);

      let colls = this.doesCollide();
      if (colls.length == 0) continue;

      let coll = colls[0];
      let block = coll.block;
      let point = coll.point;

      if (allPointsHave(colls, "bounce")) {
        p.pos.y -= step * Math.sign(p.vel.y);
        p.vel.y *= -bounceFactor;
        continue;
      }

      if (point == 2 || point == 3) {
        let a = blocks[block[0]].launch || 0;
        let b = blocks[colls[1]?.block[0] || 0]?.launch || 0;
        if (a || b) {
          p.pos.y -= step * Math.sign(p.vel.y);
          p.vel.y = -Math.max(a, b) / fps;
          continue;
        }
        

        p.grounded = coyoteTime * fps;
        p.inJump = false;

        for (let j = 0; j < Math.abs(p.vel.y * 50); j++) {
          if (j == 0) continue;
          game.particles.push({
            pos: p.pos._subV(new Vec(0, step * Math.sign(p.vel.y))),
            size: 1 / 16,
            time: Math.floor(Math.random() * 40) + 40,
            c: game.theme[1],
            rps: 0.5,
            vel: new Vec(Math.random() * 0.04 - 0.02, Math.random() * 0.02 - 0.02),
  
            gravity: 0.1,
  
            physics: true,
          });
        }
      }

      if (allPointsHave(colls, "hurt")) {
        game.restart()
      }


      p.pos.y -= step * Math.sign(p.vel.y);
      p.vel.y = 0;

      break;
    }

    if (!game.unlockWallJump) p.walled = 0;
  }

  doesCollide() {
    return game.doesCollide({x: this.pos.x - playerW / 2, y: this.pos.y - playerH, z: playerW, w: playerH});
  }
}