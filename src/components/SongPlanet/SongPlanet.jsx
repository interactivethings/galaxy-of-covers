/**
 * @jsx React.DOM
 */

var React = require('react')

require('components/SongPlanet/SongPlanet.scss')

function getPosition(rx, ry, t) {

}

var SongPlanet = React.createClass({

  componentDidMount() {
    console.log('mounted', this.props);
  },

  render() {
    return (
      <g transform={'rotate(' + this.props.rotation + ')'}>
        <circle cx={this.props.x} cy={this.props.y} r={this.props.r} fill={this.props.color} />
        <path></path>
      </g>
    )
  }
})

module.exports = SongPlanet
