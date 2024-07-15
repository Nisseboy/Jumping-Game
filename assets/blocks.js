let blocks = [
  undefined,
  {//Wall
    draw: (pos, data) => {rect(pos.x, pos.y, pos.z, pos.w)}
  },
  {//Spike ball
    hurt: true,
    outline: false,
    hitbox: "circle",
    draw: (pos, data) => {triangle(
      pos.x, pos.y + pos.w * 0.25, 
      pos.x + pos.z, pos.y + pos.w * 0.25,
      pos.x + pos.z / 2, pos.y + pos.w,
    );triangle(
      pos.x, pos.y + pos.w * 0.75, 
      pos.x + pos.z, pos.y + pos.w * 0.75,
      pos.x + pos.z / 2, pos.y,
    );}
  },
  {//Bouncy ball
    bounce: true,
    outline: false,
    hitbox: "circle",
    draw: (pos, data) => {ellipse(pos.x + pos.z / 2, pos.y + pos.w / 2, pos.z, pos.w)}
  },
  {//Turret
    outline: false,
    shoot: true,
    hitbox: "circle",
    draw: (pos, data) => {
      let size = width / (scene == editor ? 32 : 16);

      ellipse(pos.x + pos.z / 2, pos.y + pos.w / 2, pos.z * 0.75, pos.w * 0.75);
      let a = 0;
      if (data) {a = data.a + data.rps * Math.PI * 2 * (scene == editor ? 0 : game.time) / fps}

      strokeWeight(size / 8);
      stroke(0);
      line(pos.x + pos.z / 2, pos.y + pos.w / 2, pos.x + pos.z / 2 + Math.cos(a) * size / 2, pos.y + pos.w / 2 + Math.sin(a) * size / 2);
    },
    defaultData: {a: 0, rps: 0.4, sps: 4},
  },
  {//Bouncy plate
    launch: 13,
    outline: false,
    draw: (pos, data) => {rect(pos.x, pos.y, pos.z, pos.w); ellipse(pos.x + pos.z / 2, pos.y - pos.w / 10, pos.z, pos.w / 10)}
  },
];