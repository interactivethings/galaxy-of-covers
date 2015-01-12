/**
 * @jsx React.DOM
 */

var React = require('react')

require('components/TimelinePlanet/TimelinePlanet.scss')

var SvgUtil = require('util/svgutil')

function clipPathCircleTemplate(data) {
  return [
    '<clipPath id="' + data.id + '"">',
      '<circle cx="0" cy="0" r="' + data.r + '""></circle>',
    '</clipPath>'
  ].join('')
}

function clipPathPolygonTemplate(data) {
  return [
    '<clipPath id="' + data.id + '"">',
      '<polygon points="' + data.points + '" transform="rotate(' + -data.rotation + ')"></polygon>',
    '</clipPath>'
  ].join('')
}

function getShadowRect(radius, rotation) {
  var wh = radius * 2
  return (
    <rect
      transform={'rotate(' + rotation + ')'}
      transformOrigin={'0 50%'}
      fill={'#000'}
      opacity={0.25}
      x={0}
      y={-radius}
      width={wh}
      height={wh}
    />
  )
}

var TimelinePlanet = React.createClass({

  componentWillMount() {
    this.setState({
      clipPathId: 'tlplanetclip' + this.props.id
    })
  },

  render() {
    if (this.props.sides === -1) {
      return (
        <g transform={SvgUtil.translateString(this.props.cx, this.props.cy)}>
          <defs dangerouslySetInnerHTML={{__html: clipPathCircleTemplate({
            id: this.state.clipPathId,
            r: this.props.r
          })}} />
          <circle
            cx={0}
            cy={0}
            r={this.props.r}
            fill={this.props.color}
          />
          {getShadowRect(this.props.r, this.props.rotation)}
        </g>
      )
    } else {
      var polygonPath = SvgUtil.getPolygonPoints(0, 0, this.props.r, this.props.sides)
      return (
        <g transform={SvgUtil.translateString(this.props.cx, this.props.cy)}>
          <defs dangerouslySetInnerHTML={{__html: clipPathPolygonTemplate({
            id: this.state.clipPathId,
            points: polygonPath,
            rotation: this.props.rotation
          })}} />
          <polygon
            points={polygonPath}
            fill={this.props.color}
          />
          {getShadowRect(this.props.r, this.props.rotation)}
        </g>
      )
    }
  },

  componentDidMount() {
    var rect = this.getDOMNode().children[2];
    rect.setAttribute('clip-path', 'url(#' + this.state.clipPathId + ')')
  }

})

module.exports = TimelinePlanet
