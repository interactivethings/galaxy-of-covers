var React = require('react')

require('components/SongSystem/SongSystem.scss')

var SongPlanet = require('components/SongPlanet/SongPlanet')
,   SongOrbit = require('components/SongPlanet/SongOrbit')
,   ViewActions = require('actions/ViewActions')

function translateString(x, y) {
  return 'translate(' + x + ',' + y + ')'
}

var SongSystem = React.createClass({

  onMouseEnter() {
    ViewActions.hoverOnSongSystem(this.props.id)
  },

  onClick() {
    ViewActions.clickOnSongSystem(this.props.id)
  },

  shouldComponentUpdate(newProps, newState) {
    var curProps = this.props
    ,   prop
    for (prop in newProps) {
      if (newProps[prop] !== curProps[prop]) {
        return true
      }
    }
    return false
  },

  render() {
    var orbits = []
    ,   planets = []
    ,   orbitRadScale = this.props.scales.getOrbitRadiusScale()
    ,   radScale = this.props.scales.getRadiusScale()
    ,   colorScale = this.props.scales.getColorScale()
    ,   rotationScale = this.props.scales.getRotationScale()
    ,   speedScale = this.props.scales.getSpeedScale()
    ,   sidesScale = this.props.scales.getEdgesScale()

    this.props.songData.versions.forEach((versionData, i) => {
      if (!versionData.echonest || !versionData.spotify) return;

      var ellipseRadius = orbitRadScale(versionData.parsedDate)
      ,   yMult = 3 / 5
      ,   songProps =
          { orbitRadX: ellipseRadius
          , orbitRadY: ellipseRadius * yMult
          , r: radScale(versionData.spotify.popularity)
          , color: colorScale(versionData.genre)
          , rotation: rotationScale(versionData.echonest.valence)
          , speed: speedScale(versionData.echonest.energy)
          , sides: sidesScale(versionData.echonest.speechiness)
          , shouldAnimate: this.props.animate
          }
      ,   id = versionData.id

      orbits.push(
        <SongOrbit key={'orbit-'+id} {...songProps} />
      )
      planets.push(
        <SongPlanet key={id} {...songProps} />
      )
    })

    var centerX = this.props.w / 2, centerY = this.props.h / 2

    return (
      <g
        className="SongSystem"
        transform={translateString(this.props.x + centerX, this.props.y + centerY)}
        onMouseEnter={this.onMouseEnter}
        onClick={this.onClick}
      >
        <rect className="SoundSystem-background" x={-centerX} y={-centerY} width={this.props.w} height={this.props.h} fill={"transparent"} stroke="none" />
        {orbits}
        {planets}
        <circle r="5" fill="#fff" />
      </g>
    )
  }

})

module.exports = SongSystem
