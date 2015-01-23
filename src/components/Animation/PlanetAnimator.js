var SvgUtil = require('util/svgutil')

var cos = Math.cos
,   sin = Math.sin

function getPosition(rx, ry, t, speed) {
  // calculates the planet's position given rx, ry, and t
  return [cos(t * speed) * rx, sin(t * speed) * ry]
}

var getRotateAndTranslate = SvgUtil.getRotateAndTranslate

function getBlinkOpacity(t, blinkSpeed) {
  return (sin(t * blinkSpeed) + 1.8) / 2
}

function PlanetAnimator(node, planetId, moveSpeed, blinkSpeed, ellipseRadX, ellipseRadY, rotationOffset) {
  var animatorApi =
  { id: planetId
  , stop: false
  , play: true
  , animate: function(elapsedTime) {
      if (animatorApi.stop) return true
      if (!animatorApi.play) return false

      var pos = getPosition(ellipseRadX, ellipseRadY, elapsedTime, moveSpeed)
      node.setAttribute('transform', getRotateAndTranslate(rotationOffset, pos[0], pos[1]))
      node.setAttribute('opacity', getBlinkOpacity(elapsedTime, blinkSpeed))
    }
  }

  return animatorApi
}

PlanetAnimator.getPosition = getPosition

module.exports = PlanetAnimator
