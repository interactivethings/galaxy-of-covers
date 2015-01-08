/**
 * @jsx React.DOM
 */

var React = require('react')
,   d3 = require('d3')

require('components/TimelinePlanet/TimelinePlanet.scss')

var SvgUtil = require('util/svgutil')

var TimelinePlanet = React.createClass({

  render() {
    if (this.props.sides === -1) {
      return (
        <circle
          cx={this.props.cx}
          cy={this.props.cy}
          r={this.props.r}
          fill={this.props.color}
        />
      )
    } else {
      return (
        <polygon
          points={SvgUtil.getPolygonPoints(this.props.cx, this.props.cy, this.props.r, this.props.sides)}
          fill={this.props.color}
        />
      )
    }
  }

})

module.exports = TimelinePlanet
