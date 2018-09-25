'use strict';

var d3 = require('d3')

var cos = Math.cos
var sin = Math.sin

function planetPosition(planet, t) {
  var ang = t * planet.orbitSpeed
  ,   px = cos(ang) * planet.orbitRadiusX
  ,   py = sin(ang) * planet.orbitRadiusY
  ,   rc = planet.orbitRotationOffsetCos
  ,   rs = planet.orbitRotationOffsetSin
  ,   x  = planet.galaxyX + rc * px - rs * py
  ,   y  = planet.galaxyY + rs * px + rc * py
  return 'translate(' + x + ',' + y + ')'
}

function planetOpacity(blinkSpeed, t) {
  return 0.6 + 0.2 * (sin(t * blinkSpeed) + 1) // 0.6 + 0.4 * ((sin(t*bs) + 1) / 2)
}

module.exports = {
  planetPosition: planetPosition,
  planetOpacity: planetOpacity
}
