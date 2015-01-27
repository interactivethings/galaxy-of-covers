var Vec2 = require('svec2')
'use strict';


var PI = Math.PI
,   HALF_PI = PI / 2
,   TWO_PI = PI * 2
,   DEG_TO_RAD = 180 / PI

var SvgUtil = {

  getRotateTransform(rot) {
    return 'rotate(' + rot + ')'
  },

  translateString(x, y) {
    return 'translate(' + x + ',' + y + ')'
  },

  getRotateAndTranslate(rot, x, y) {
    return 'rotate(' + rot + ') translate(' + x + ',' + y + ')'
  },

  getTranslateAndRotate(x, y, rot) {
    return 'translate(' + x + ',' + y + ') rotate(' + rot + ')'
  },

  joinPolygonPoints(pts) {
    return pts.join(' ')
  },

  getPolygonPoints(x, y, r, sides) {
    return this.joinPolygonPoints(this.getPolygonPointsArray(x, y, r, sides))
  },

  getPolygonPointsArray(x, y, r, sides) {
    return this.getOffsetPolygonPointsArray(x, y, r, sides, 0)
  },

  getOffsetPolygonPointsArray(x, y, r, sides, offsetRotation) {
    var rot = TWO_PI / sides
    ,   pts = []
    d3.range(sides).forEach(function(i) {
      var a = i * rot - PI - offsetRotation
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r])
    })
    return pts
  }

}

module.exports = SvgUtil
