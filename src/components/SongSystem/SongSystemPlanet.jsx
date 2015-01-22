var React = require('react')
,   d3 = require('d3')

var SvgUtil = require('util/svgutil')

function getPosition(rx, ry, t, speed) {
  // calculates the planet's position given rx, ry, and t
  var x = Math.cos(t * speed) * rx,
      y = Math.sin(t * speed) * ry
  return [x, y]
}

function getBlinkOpacity(t, blinkSpeed) {
  return (Math.sin(t * blinkSpeed) + 1.8) / 2
}

var SongSystemPlanet = React.createClass({

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
    ,   bs = this.props.blinkSpeed
    ,   rx = this.props.orbitRadX
    ,   ry = this.props.orbitRadY
    ,   rotation = this.props.rotation
    ,   element = this.getDOMNode()

    function animate(t) {
      if (animationTracker.stop) return true
      if (animationTracker.pause) return false

      var pos = getPosition(rx, ry, t, s)
      element.setAttribute('transform', SvgUtil.getRotateAndTranslate(rotation, pos[0], pos[1]))
      element.setAttribute('opacity', getBlinkOpacity(t, bs))
    }

    d3.timer(animate)
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

    if (this.props.sides === -1) {
      return (
        <circle
          transform={SvgUtil.getRotateAndTranslate(this.props.rotation, planetPos[0], planetPos[1])}
          cx={0}
          cy={0}
          r={this.props.r}
          fill={this.props.color}
        />
      )
    } else {
      return (
        <polygon
          transform={SvgUtil.getRotateAndTranslate(this.props.rotation, planetPos[0], planetPos[1])}
          points={SvgUtil.getPolygonPoints(0, 0, this.props.r, this.props.sides)}
          fill={this.props.color}
        />
      )
    }
  },

  componentWillUnmount() {
    this.animationTracker.stop = true
  }

})

module.exports = SongSystemPlanet
