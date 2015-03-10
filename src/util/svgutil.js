'use strict';

var d3 = require('d3')
,   Vec2 = require('svec2')

var PI = Math.PI
,   HALF_PI = PI / 2
,   TWO_PI = PI * 2
,   DEG_TO_RAD = 180 / PI

var SvgUtil = {

  acquire(rootSelection, className, elementType) {
    var selection = rootSelection.selectAll('.' + className.replace(' ', '.'))

    if (selection.empty() && elementType) {
      selection = rootSelection.append(elementType)
        .attr('class', className)
    }

    return selection
  },

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
  },

  arcString(sx, sy, rx, ry, rot, largeArc, sweep, ex, ey) {
    return 'M ' + sx + ' ' + sy + ' A ' + rx + ' ' + ry + ' ' + rot + ' ' + Number(!!largeArc) + ' ' + Number(!!sweep) + ' ' + ex + ' ' + ey;
  }

}

module.exports = SvgUtil
