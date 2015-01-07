/**
 * @jsx React.DOM
 */

var React = require('react')
,   d3 = require('d3')

require('components/SongSystem/SongSystem.scss')

var SongPlanet = require('components/SongPlanet/SongPlanet')
,   SongOrbit = require('components/SongPlanet/SongOrbit')
,   ViewActions = require('actions/ViewActions')

function translateString(x, y) {
  return 'translate(' + x + ',' + y + ')'
}

function versionId(versionData) {
  return versionData.performer + '-' + versionData.title + '-' + versionData.date
}

var monthDayYear = d3.time.format('%B %e, %Y')
,   monthYear = d3.time.format('%B %Y')
,   year = d3.time.format('%Y')

function parseDate(dateString) {
  return monthDayYear.parse(dateString) || monthYear.parse(dateString) || year.parse(dateString)
}

var SongSystem = React.createClass({

  onMouseOver() {
    ViewActions.hoverOnSongSystem(this.props.id)
  },

  onMouseOut() {
    ViewActions.hoverOffSongSystem(this.props.id)
  },

  render() {
    var orbits = []
    ,   planets = []
    ,   orbitRadScale = this.props.scales.getOrbitRadiusScale()
    ,   radScale = this.props.scales.getRadiusScale()
    ,   colorScale = this.props.scales.getColorScale()
    ,   rotationScale = this.props.scales.getRotationScale()
    ,   speedScale = this.props.scales.getSpeedScale()

    this.props.songData.versions.forEach((versionData, i) => {
      if (!versionData.echonest || !versionData.spotify) return;

      var ellipseRadius = orbitRadScale(parseDate(versionData.date))
      ,   yMult = 3 / 5
      ,   songProps = {
            orbitRadX: ellipseRadius,
            orbitRadY: ellipseRadius * yMult,
            r: radScale(versionData.spotify.popularity),
            color: colorScale(Math.round(Math.random() * 5)),
            rotation: rotationScale(versionData.echonest.valence),
            speed: speedScale(versionData.echonest.energy),
            shouldAnimate: this.props.animate
          }

      var id = versionId(versionData)
      if (versionData.echonest) {
        orbits.push(
          <SongOrbit key={'orbit-'+id} {...songProps} />
        )
      }
      planets.push(
        <SongPlanet key={id} {...songProps} />
      )
    })

    return (
      <g className="SongSystem" transform={translateString(this.props.x, this.props.y)} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut} >
        {orbits}
        {planets}
        <circle r="5" fill="#fff" />
      </g>
    )
  }

})

module.exports = SongSystem
