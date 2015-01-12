(function(global) {
  'use strict';

  function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Vec2.fromVals = function(x, y) {
    return new Vec2(x, y);
  };

  Vec2.fromScalar = function(s) {
    return new Vec2(s, s);
  };

  Vec2.zeroVec = function() {
    return new Vec2(0, 0);
  };

  Vec2.fromArray = function(a) {
    return new Vec2(a[0], a[1]);
  };

  Vec2.prototype = {

    add: function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },

    sub: function(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },

    scale: function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    },

    negate: function() {
      this.x *= -1;
      this.y *= -1;
    },

    zero: function() {
      this.x = this.y = 0;
    },

    normalize: function() {
      var m = this.mag();
      this.x /= m;
      this.y /= m;
      return this;
    },

    mag: function() {
      var x = this.x,
          y = this.y;
      return Math.sqrt(x * x + y * y);
    },

    dot: function(v) {
      return this.x * v.x + this.y * v.y;
    },

    negated: function() {
      return new Vec2(- this.x, - this.y);
    },

    normalized: function() {
      var m = this.mag();
      return new Vec2(this.x / m, this.y / m);
    }

  };

  Vec2.sum = function(va, vb) {
    return new Vec2(va.x + vb.x, va.y + vb.y);
  };

  Vec2.diff = function(va, vb) {
    return new Vec2(va.x - vb.x, va.y - vb.y);
  };

  // static dot product a * b
  Vec2.dotProduct = function(va, vb) {
    return va.x * vb.x + va.y * vb.y;
  };

  // cross product a X b
  Vec2.crossProduct = function(va, vb) {
    return va.x * vb.y - va.y * vb.x;
  };

  // distance from a to b
  Vec2.dist = function(va, vb) {
    var dx = vb.x - va.x,
        dy = vb.y - va.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  if (typeof exports === 'object') {
    module.exports = Vec2;
  } else if (typeof global.define === 'function' && global.define.amd) {
    define([], function(){ return Vec2; });
  } else {
    global.Vec2 = Vec2;
  }

})();
