class Vec {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  copy() {
    return new Vec(this.x, this.y, this.z, this.w);
  }
  toArray() {
    let a = [];
    if (this.x != undefined) a.push(this.x);
    if (this.y != undefined) a.push(this.y);
    if (this.z != undefined) a.push(this.z);
    if (this.w != undefined) a.push(this.w);
    
    return a;
  }
  format() {
    let a = "(";
    if (this.x != undefined) a += this.x;
    if (this.y != undefined) a += ", " + this.y;
    if (this.z != undefined) a += ", " + this.z;
    if (this.w != undefined) a += ", " + this.w;
    
    return a + ")";
  }
  from(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  }

  sqMag() {
    let m = 0;
    if (this.x) m += this.x ** 2;
    if (this.y) m += this.y ** 2;
    if (this.z) m += this.z ** 2;
    if (this.w) m += this.w ** 2;
    return m;
  }
  mag() {
    return Math.sqrt(this.sqMag());
  }

  add(val) {
    return this.addV(new Vec(val, val, val, val));
  }
  addV(v) {
    if (this.x != undefined && v.x != undefined) this.x += v.x;
    if (this.y != undefined && v.y != undefined) this.y += v.y;
    if (this.z != undefined && v.z != undefined) this.z += v.z;
    if (this.w != undefined && v.w != undefined) this.w += v.w;

    return this;
  }

  sub(val) {
    return this.subV(new Vec(val, val, val, val));
  }
  subV(v) {
    if (this.x != undefined && v.x != undefined) this.x -= v.x;
    if (this.y != undefined && v.y != undefined) this.y -= v.y;
    if (this.z != undefined && v.z != undefined) this.z -= v.z;
    if (this.w != undefined && v.w != undefined) this.w -= v.w;

    return this;
  }

  mul(val) {
    return this.mulV(new Vec(val, val, val, val));
  }
  mulV(v) {
    if (this.x != undefined && v.x != undefined) this.x *= v.x;
    if (this.y != undefined && v.y != undefined) this.y *= v.y;
    if (this.z != undefined && v.z != undefined) this.z *= v.z;
    if (this.w != undefined && v.w != undefined) this.w *= v.w;

    return this;
  }

  div(val) {
    val = 1 / val;
    return this.mulV(new Vec(val, val, val, val));
  }
  divV(v) {
    if (this.x != undefined && v.x != undefined) this.x /= v.x;
    if (this.y != undefined && v.y != undefined) this.y /= v.y;
    if (this.z != undefined && v.z != undefined) this.z /= v.z;
    if (this.w != undefined && v.w != undefined) this.w /= v.w;

    return this;
  }


  _add(val) {return this.copy().add(val)}
  _addV(v) {return this.copy().addV(v)}
  
  _sub(val) {return this.copy().sub(val)}
  _subV(v) {return this.copy().subV(v)}
  
  _mul(val) {return this.copy().mul(val)}
  _mulV(v) {return this.copy().mulV(v)}
  
  _div(val) {return this.copy().div(val)}
  _divV(v) {return this.copy().divV(v)}
}