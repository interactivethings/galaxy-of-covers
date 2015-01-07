/**
 * @jsx React.DOM
 */

var React = require('react')
,   d3 = require('d3')

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

  componentDidMount() {
    this.circle = d3.select(this.getDOMNode())
    this.t = 0

    this.animate()
  },

  animate() {
    if (!this.props.shouldAnimate) return requestAnimationFrame(this.animate);
    this.t += 0.1
    var pos = getPosition(this.props.orbitRadX, this.props.orbitRadY, this.t, this.props.speed)
    this.circle.attr({
      cx: pos[0],
      cy: pos[1]
    })
    requestAnimationFrame(this.animate)
  },

  render() {
    var planetPos = getPosition(this.props.orbitRadX, this.props.orbitRadY, 0, this.props.speed)

    return (
      <circle cx={planetPos[0]} cy={planetPos[1]} r={this.props.r} fill={this.props.color} transform={SVGUtil.getRotateTransform(this.props.rotation)} />
    )
  }

})

module.exports = SongPlanet
