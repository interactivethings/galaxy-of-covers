/**
 * @jsx React.DOM
 */

var React = require('react')
,   d3 = require('d3')

require('components/SongTimeline/SongTimeline.scss')

var SVGUtil = require('util/svgutil')
,   DataUtil = require('util/datautil')
,   TimelinePlanet = require('components/TimelinePlanet/TimelinePlanet')

var SongTimeline = React.createClass({

  render() {
    var timeRange = DataUtil.getMinMax(this.props.songData.versions, (item) => item.parsedDate)
    ,   energyRange = DataUtil.getMinMax(this.props.songData.versions, function(item) { return item.echonest ? item.echonest.energy : 0; })
    ,   timelineXScale = d3.scale.linear().domain(timeRange).range(this.props.timelineXRange)
    ,   timelineYScale = d3.scale.linear().domain(energyRange).range(this.props.timelineYRange)
    ,   radiusScale = this.props.scales.getTimelineRadiusScale()
    ,   colorScale = this.props.scales.getColorScale()
    ,   edgesScale = this.props.scales.getEdgesScale()

    var planets = []
    this.props.songData.versions.map(function(versionData, i) {
      if (!versionData.echonest) return;

      var songProps = {
        cx: timelineXScale(versionData.parsedDate),
        cy: timelineYScale(versionData.echonest.energy),
        r: radiusScale(versionData.spotify.popularity),
        color: colorScale(versionData.genre),
        sides: edgesScale(versionData.echonest.speechiness)
      }

      planets.push(
        <TimelinePlanet key={versionData.id} {...songProps} />
      )
    })

    // sort in descending radius order
    planets.sort(function(a, b) {
      return b.props.r - a.props.r
    })

    return <g transform={SVGUtil.translateString(0, this.props.timelineBaselineY)}>
            {planets}
          </g>
  }

})

module.exports = SongTimeline
