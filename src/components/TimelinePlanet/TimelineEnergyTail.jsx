/**
 * @jsx React.DOM
 */

var React = require('react')

var TimelineEnergyTail = React.createClass({

  render() {
    var x = this.props.cx
    ,   y = this.props.cy
    ,   r = this.props.r
    ,   p1 = this.props.tailpt1
    ,   p2 = this.props.tailpt2
    ,   pts = [
          [x, 0],
          [x + p1[0], y + p1[1]],
          [x + p2[0], y + p2[1]],
          [x, 0]
        ]
    return (
      <polygon points={pts.join(' ')} fill={"url(#" + this.props.gradientId + ")"} />
    )
  }

})

module.exports = TimelineEnergyTail
