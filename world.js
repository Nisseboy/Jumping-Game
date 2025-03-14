class World {
  constructor(w, h) {
    if (h == undefined) {
      let data = JSON.parse(w);
      this.w = data.w;
      this.h = data.h;
      
      this.g = data.g;
  
      this.player = {pos: data.player.pos};
      this.key = {pos: data.key.pos};
      this.door = data.door;
      this.text = data.text;
      this.goldTime = data.goldTime;
    } else {
      this.w = w;
      this.h = h;

      this.g = new Array(w).fill(0).map((e, x) => {return new Array(h).fill(0).map((e, y) => {return y == 7 ? [1] : [0]})});

      this.player = {
        pos: new Vec(0.5, 1),
      };

      this.key = {
        pos: new Vec(8, 6),
      };

      this.door = {
        pos: new Vec(15, 6),
      };

      this.text = {
        pos: new Vec(8, 3),
        text: "*",
      };

      this.goldTime = {
        time: 999,
      };
    }

    this.player = new Player(this.player.pos);

    this.key = {
      pos: new Vec().from(this.key.pos),
      pickedUp: false,
    };

    this.door = {
      pos: new Vec().from(this.door.pos),
    };

    this.text = {
      pos: new Vec().from(this.text? this.text.pos : {x: 8, y: 3}),
      text: this.text?.text || "*",
    };

    this.goldTime = {
      time: this.goldTime?.time || 999,
    };
  }

  get(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return [1];
    return this.g[Math.floor(x)][Math.floor(y)];
  }

  addCol(n = 1) {
    for (let i = 0; i < n; i++) {
      this.w++;
      this.g.push(new Array(this.h).fill(0).map(e => {return [0]}));
    }
  }
  addRow(n = 1) {
    for (let i = 0; i < n; i++) {
      this.h++;
      for (let j = 0; j < this.w; j++) {
        this.g[j].push([0]);
      }
    }
  }

  shiftX(n = 1) {
    for (let i = 0; i < n; i++) {
      for (let j = this.w - 1; j >= 1; j--) {
        this.g[j] = this.g[j - 1];
      }
      this.g[0] = new Array(this.h).fill(0).map(e => {return [0]});
    }
  }

  shiftY(n = 1) {
    for (let i = 0; i < n; i++) {
      for (let j = this.w - 1; j >= 0; j--) {
        for (let k = this.h - 1; k >= 1; k--) {
          this.g[j][k] = this.g[j][k - 1];
        }
        this.g[j][0] = [0];
      }
    }
  }

  export() {
    let data = {};
    data.w = this.w;
    data.h = this.h;

    data.g = this.g;

    data.player = {pos: this.player.pos};
    data.key = {pos: this.key.pos};
    data.door = this.door;
    data.text = this.text;
    data.goldTime = this.goldTime;

    return JSON.stringify(data);
  }
}