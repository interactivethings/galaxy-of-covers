var HALF_PI = Math.PI / 2

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

  getPolygonPoints(x, y, r, sides) {
    var rot = 2 * Math.PI / sides
    ,   pts = []
    d3.range(sides).forEach(function(i) {
      var a = i * rot - HALF_PI
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r])
    })
    return pts.join(' ')
  }

}

module.exports = SvgUtil
