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
  ,   pos = [planet.galaxyX + rc * px - rs * py, planet.galaxyY + rs * px + rc * py]
  return 'translate(' + pos.join(',') + ')'
}

function planetOpacity(blinkSpeed, t) {
  return (sin(t * blinkSpeed) + 1.8) / 2
}

function startContinuousAnimation(datum) {
  var node = this
  datum.stopAnimation = false

  d3.timer(function(time) {
    if (datum.pauseAnimation) return false

    node.setAttribute('transform', planetPosition(datum, time))
    node.setAttribute('opacity', planetOpacity(datum.blinkSpeed, time))

    return datum.stopAnimation
  })
}

function stopContinuousAnimation(datum) {
  datum.stopAnimation = true
}

module.exports = {
  planetPosition: planetPosition,
  startContinuousAnimation: startContinuousAnimation,
  stopContinuousAnimation: stopContinuousAnimation
}
