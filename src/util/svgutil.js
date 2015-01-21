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

  getEnergyTailFade() {
    return [
      '<linearGradient id="energyTailFadeColor" x1="0.5" y1="0" x2="0.5" y2="1">'
    ,   '<stop offset="0%" stop-color="rgba(255,255,255,0.5)" />'
    ,   '<stop offset="100%" stop-color="rgba(255,255,255,0.05)" />'
    , '</linearGradient>'
    ].join('')
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
      '<radialGradient id="galaxyBackgroundGradient" cx="51.7999113%" cy="13.0121779%" fx="51.7999113%" fy="13.0121779%" r="86.9878221%" >'
    ,   '<stop stop-color="#000000" stop-opacity="0" offset="0%"></stop>'
    ,   '<stop stop-color="#000000" stop-opacity="0" offset="48.4275351%"></stop>'
    ,   '<stop stop-color="#000000" offset="100%"></stop>'
    , '</radialGradient>'
    ].join('')
  },

  getGalaxyShadow() {
    return [
      '<filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="galaxyShadow">'
    ,   '<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>'
    ,   '<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>'
    ,   '<feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1"></feColorMatrix>'
    ,   '<feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>'
    ,   '<feGaussianBlur stdDeviation="1.5" in="shadowOffsetInner1" result="shadowBlurInner1"></feGaussianBlur>'
    ,   '<feComposite in="shadowBlurInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>'
    ,   '<feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0" in="shadowInnerInner1" type="matrix" result="shadowMatrixInner1"></feColorMatrix>'
    ,   '<feMerge>'
    ,     '<feMergeNode in="shadowMatrixOuter1"></feMergeNode>'
    ,     '<feMergeNode in="SourceGraphic"></feMergeNode>'
    ,     '<feMergeNode in="shadowMatrixInner1"></feMergeNode>'
    ,   '</feMerge>'
    , '</filter>'
    ].join('')
  }

}

module.exports = SvgUtil
