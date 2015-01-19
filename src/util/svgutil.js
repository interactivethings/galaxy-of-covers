var Vec2 = require('svec2')

var PI = Math.PI
,   HALF_PI = PI / 2
,   TWO_PI = PI * 2
,   PI_TO_RAD = 180 / PI

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

  getStarGlow() {
    return [
      '<filter x="-200%" y="-200%" width="500%" height="500%" id="starGlowFilter">'
    ,   '<feGaussianBlur stdDeviation="8" result="BLUR_OUT" />'
    ,   '<feMerge>'
    ,     '<feMergeNode in="BLUR_OUT" />'
    ,     '<feMergeNode in="SourceGraphic" />'
    ,   '</feMerge>'
    , '</filter>'
    ].join('')
  },

  getGalaxyGradient() {
    return [
      '<radialGradient id="galaxyBackgroundGradient" r="100%" cx="40%" cy="30%" >'
    ,   '<stop offset="0" stop-opacity="0" stop-color="black" />'
    ,   '<stop offset="0.5" stop-opacity="0" stop-color="black" />'
    ,   '<stop offset="1" stop-opacity="1" stop-color="black" />'
    , '</radialGradient>'
    ].join('')
  },

  getGalaxyShadow() {
    return [
      '<filter id="galaxyShadow" >'
    , '</filter>'
    ].join('')
  }

}

module.exports = SvgUtil
