var React = require('react')

var SVGUtil = require('util/svgutil')

var SongSystemOrbit = React.createClass({

  render() {
    return (
      <ellipse
        cx={0}
        cy={0}
        rx={this.props.orbitRadX}
        ry={this.props.orbitRadY}
        fill={"none"}
        stroke={"#aaa"}
        strokeWidth={0.5}
        transform={SVGUtil.getRotateTransform(this.props.rotation)}
      ></ellipse>
    )
  }

})

module.exports = SongSystemOrbit
