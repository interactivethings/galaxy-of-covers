var React = require('react')

require('components/SongSystem/SongSystem.scss')

var SongSystemPlanet = require('components/SongSystem/SongSystemPlanet')
,   SongSystemOrbit = require('components/SongSystem/SongSystemOrbit')
,   ViewActions = require('actions/ViewActions')
,   Layout = require('components/Layout')
,   AnimationManager = require('components/Animation/AnimationManager')

function translateString(x, y) {
  return 'translate(' + x + ',' + y + ')'
}

var SongSystem = React.createClass({

  onMouseEnter() {
    ViewActions.hoverOnSongSystem(this.props.id)
  },

  onMouseLeave() {
    ViewActions.hoverOffSongSystem()
  },

  onClick() {
    ViewActions.clickOnSongSystem(this.props.id)
  },

// this works like a charm, but unfortunately it doesn't respect changes to genre filters...
/*  shouldComponentUpdate(newProps, newState) {
    var curProps = this.props
    ,   prop
    for (prop in newProps) {
      if (newProps[prop] !== curProps[prop]) {
        return true
      }
    }
    return false
  },*/

  render() {
    var orbits = []
    ,   planets = []
    ,   orbitRadScale = this.props.scales.getOrbitRadiusScale()
    ,   radScale = this.props.scales.getRadiusScale()
    ,   colorScale = this.props.scales.getColorScale()
    ,   rotationScale = this.props.scales.getRotationScale()
    ,   speedScale = this.props.scales.getSpeedScale()
    ,   blinkScale = this.props.scales.getBlinkScale()
    ,   sidesScale = this.props.scales.getEdgesScale()
    ,   genreFilter = this.props.genreFilter
    ,   songId = this.props.id

    AnimationManager.toggleSystemPlay(this.props.id, this.props.animate)

    this.props.songData.versions.forEach((versionData, i) => {
      if (!versionData.echonest || !versionData.spotify) return

      var genre = versionData.genre
      ,   versionId = versionData.id
      if (genreFilter.get(genre)) {
        AnimationManager.togglePlanetPlay(versionId, false)
        return
      }

      var ellipseRadius = orbitRadScale(versionData.parsedDate)
      ,   yMult = 3 / 5
      ,   planetProps =
          { orbitRadX: ellipseRadius
          , orbitRadY: ellipseRadius * yMult
          , r: radScale(versionData.spotify.popularity)
          , color: colorScale(genre)
          , rotation: rotationScale(versionData.echonest.valence)
          , speed: speedScale(versionData.echonest.energy)
          , blinkSpeed: blinkScale(versionData.echonest.tempo)
          , sides: sidesScale(versionData.echonest.speechiness)
          , songId: songId
          , versionId: versionId
          }

      orbits.push(
        <SongSystemOrbit key={'orbit-'+versionId} {...planetProps} />
      )
      planets.push(
        <SongSystemPlanet key={'planet-'+versionId} {...planetProps} />
      )
    })

    return (
      <g
        className="SongSystem"
        transform={translateString(this.props.x, this.props.y)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
      >
        {this.props.isHovered ?
          <circle className="SongSystem--background" cx={0} cy={0} r={this.props.r + 15} stroke="rgba(0,0,0,0.15)" strokeOpacity="0.153475996" fill="url(#galaxyBackgroundGradient)" fillOpacity="0.2" transform="rotate(-20)" />
        :
          <circle className="SongSystem--background" cx={0} cy={0} r={this.props.r + 15} fill="transparent" stroke="none" />
        }
        {orbits}
        {planets}
        <circle className="SongSystem--glowingstar" r="5" fill="#fff" />
        <text className="SongSystem--songtitle" dy={-20} >{this.props.songData.title}</text>
      </g>
    )
  },

  componentDidMount() {
    var node = d3.select(this.getDOMNode())

    // optimize this later (only render if within window)
/*    var bounds = this.getDOMNode().getBoundingClientRect()
    ,   scrollTop = Layout.getScrollY()*/

    node.select('.SongSystem--glowingstar')
      .attr('filter', 'url(#starGlowFilter)')

    if (this.props.isHovered) {
      node.select('.SongSystem--background')
        .attr('filter', 'url(#galaxyShadow)')
    }
  },

  componentWillUnmount() {
    AnimationManager.stopSystem(this.props.id)
  }

})

module.exports = SongSystem
