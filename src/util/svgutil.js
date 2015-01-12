var Vec2 = require('util/Vec2')

var HALF_PI = Math.PI / 2
var PI_TO_RAD = 180 / Math.PI

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

  joinPolygonPoints(pts) {
    return pts.join(' ')
  },

  getPolygonPoints(x, y, r, sides) {
    return this.joinPolygonPoints(this.getPolygonPointsArray(x, y, r, sides))
  },

  getPolygonPointsArray(x, y, r, sides) {
    var rot = 2 * Math.PI / sides
    ,   pts = []
    d3.range(sides).forEach(function(i) {
      var a = i * rot
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r])
    })
    return pts
  },

  getPolygonPointsWithOffset(x, y, r, sides, offsetRotation) {
    var rot = 2 * Math.PI / sides
    ,   pts = []
    d3.range(sides).forEach(function(i) {
      var a = i * rot - Math.PI - offsetRotation
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r])
    })
    return pts
  }

}

module.exports = SvgUtil
