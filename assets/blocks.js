let blocks = [
  undefined,
  {//Wall
    draw: (pos, data) => {rect(pos.x, pos.y, pos.z, pos.w)}
  },
  {//Spike ball
    hurt: true,
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
];