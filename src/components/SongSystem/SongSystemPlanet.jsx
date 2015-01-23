var React = require('react')
,   d3 = require('d3')

var SvgUtil = require('util/svgutil')
,   AnimationManager = require('components/Animation/AnimationManager')
,   PlanetAnimator = require('components/Animation/PlanetAnimator')

var SongSystemPlanet = React.createClass({

  componentDidMount() {
    var AnimatedNode = PlanetAnimator(this.getDOMNode(), this.props.versionId, this.props.speed, this.props.blinkSpeed, this.props.orbitRadX, this.props.orbitRadY, this.props.rotation)
    AnimationManager.registerSystemPlanet(this.props.songId, AnimatedNode)
  },

  shouldComponentUpdate(newProps, newState) {
    var updateProps = ['r', 'color', 'rotation']
    ,   curProps = this.props
    ,   prop
    for (var i = 0, l = updateProps.length; i < l; ++i) {
      prop = updateProps[i]
      if (newProps[prop] !== curProps[prop]) return true
    }
    return false
  },

  render() {
    var planetPos = PlanetAnimator.getPosition(this.props.orbitRadX, this.props.orbitRadY, 0, this.props.speed)

    if (this.props.sides === -1) {
      return (
        <circle
          transform={SvgUtil.getRotateAndTranslate(this.props.rotation, planetPos[0], planetPos[1])}
          cx={0}
          cy={0}
          opacity={1}
          r={this.props.r}
          fill={this.props.color}
        />
      )
    } else {
      return (
        <polygon
          transform={SvgUtil.getRotateAndTranslate(this.props.rotation, planetPos[0], planetPos[1])}
          opacity={1}
          points={SvgUtil.getPolygonPoints(0, 0, this.props.r, this.props.sides)}
          fill={this.props.color}
        />
      )
    }
  }

})

module.exports = SongSystemPlanet
