/**
 * @jsx React.DOM
 */

var React = require('react')
,   TweenMax = require('TweenMax')

require('components/SongPlanet/SongPlanet.scss')

var Vec2 = require('util/vec2')
,   SVGUtil = require('util/svgutil')

function getPosition(rx, ry, t, speed) {
  // calculates the planet's position given rx, ry, and t
  var x = Math.cos(t * speed) * rx,
      y = Math.sin(t * speed) * ry
  return [x, y]
}

var SongPlanet = React.createClass({

  getInitialState() {
    this.animationTracker = {
      pause: false,
      stop: false
    }
    return null
  },

  componentDidMount() {
    var animationTracker = this.animationTracker

    var t = 0
    ,   s = this.props.speed
    ,   rx = this.props.orbitRadX
    ,   ry = this.props.orbitRadY
    ,   circle = this.getDOMNode()

    function animate() {
      if (animationTracker.stop) return true
      if (animationTracker.pause) return requestAnimationFrame(animate)

      t += 0.1

      var pos = getPosition(rx, ry, t, s)
      circle.setAttribute('cx', pos[0])
      circle.setAttribute('cy', pos[1])

      requestAnimationFrame(animate)
    }

    this.animationTracker = animationTracker

    animate()
  },

  shouldComponentUpdate(newProps, newState) {
    var updateProps = ['shouldAnimate', 'r', 'color', 'rotation']
    ,   curProps = this.props
    ,   prop
    for (var i = 0, l = updateProps.length; i < l; ++i) {
      prop = updateProps[i]
      if (newProps[prop] !== curProps[prop]) return true
    }
    return false
  },

  render() {
    this.animationTracker.pause = !this.props.shouldAnimate

    var planetPos = getPosition(this.props.orbitRadX, this.props.orbitRadY, 0, this.props.speed)

    return (
      <circle cx={planetPos[0]} cy={planetPos[1]} r={this.props.r} fill={this.props.color} transform={SVGUtil.getRotateTransform(this.props.rotation)} />
    )
  },

  componentWillUnmount() {
    this.animationTracker.stop = true
  }

})

module.exports = SongPlanet
