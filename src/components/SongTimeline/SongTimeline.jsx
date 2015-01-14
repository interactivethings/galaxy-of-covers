/**
 * @jsx React.DOM
 */

var React = require('react')
,   d3 = require('d3')

require('components/SongTimeline/SongTimeline.scss')

var SvgUtil = require('util/svgutil')
,   DataUtil = require('util/datautil')
,   Vec2 = require('svec2')
,   TimelinePlanet = require('components/TimelinePlanet/TimelinePlanet')
,   SongTimelineAxis = require('components/SongTimelineAxis/SongTimelineAxis')
,   TimelineEnergyTail = require('components/TimelinePlanet/TimelineEnergyTail')
,   TimelineGenreHeader = require('components/TimelineGenreHeader/TimelineGenreHeader')

var SongTimeline = React.createClass({

  render() {
    var genreUISpace = 60
    ,   timelineYRange = [0, -this.props.timelineBaselineY + this.props.upperUIPadding + genreUISpace]
    ,   timeRange = DataUtil.getMinMax(this.props.songData.versions, (item) => item.parsedDate)
    ,   energyRange = DataUtil.getMinMax(this.props.songData.versions, function(item) { return item.echonest ? item.echonest.energy : 0; })
    ,   timelineXScale = d3.scale.linear().domain(timeRange).range(this.props.timelineXRange)
    ,   timelineYScale = d3.scale.linear().domain(energyRange).range(timelineYRange)
    ,   radiusScale = this.props.scales.getTimelineRadiusScale()
    ,   colorScale = this.props.scales.getColorScale()
    ,   edgesScale = this.props.scales.getEdgesScale()
    ,   rotationScale = this.props.scales.getTimelineRotation()

    var planets = []
    ,   tails = []
    ,   genreSplit = {}
    this.props.songData.versions.map(function(versionData, i) {
      if (!versionData.echonest) return;

      var g = versionData.genre
      if (!genreSplit[g]) genreSplit[g] = 0
      genreSplit[g]++

      var songProps = {
        cx: timelineXScale(versionData.parsedDate),
        cy: timelineYScale(versionData.echonest.energy),
        r: radiusScale(versionData.spotify.popularity),
        color: colorScale(versionData.genre),
        sides: edgesScale(versionData.echonest.speechiness),
        rotation: rotationScale(versionData.echonest.valence)
      }

      if (songProps.sides !== -1) {
        var a = Math.floor(songProps.sides / 2) * 2 * Math.PI / songProps.sides
        ,   pt1 = new Vec2(-1, 0)
        ,   pt2 = new Vec2(Math.cos(a), Math.sin(a))
        ,   diagonal = Vec2.diff(pt2, pt1)
        ,   rot = Vec2.crossProduct(new Vec2(1, 0), diagonal)
        ,   polyPoints = SvgUtil.getOffsetPolygonPointsArray(0, 0, songProps.r, songProps.sides, rot / 2)

        songProps.polygonPoints = polyPoints
        songProps.tailpt1 = polyPoints[0]
        songProps.tailpt2 = polyPoints[Math.ceil(polyPoints.length / 2)]
      } else {
        // either side of the circle
        // (no polygonPoints needed for a circle)
        songProps.tailpt1 = [-songProps.r, 0]
        songProps.tailpt2 = [songProps.r, 0]
      }

      planets.push(
        <TimelinePlanet key={versionData.id} id={versionData.id} {...songProps} />
      )

      tails.push(
        <TimelineEnergyTail key={'tail-'+versionData.id} gradientId={"energyTailFadeColor"} {...songProps} />
      )
    })

    // sort in descending radius order
    planets.sort(function(a, b) {
      return b.props.r - a.props.r
    })

    return (
      <g transform={SvgUtil.translateString(0, this.props.timelineBaselineY)}>
        <defs>
          <linearGradient id="energyTailFadeColor" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
          <g dangerouslySetInnerHTML={{__html: getStarGlow()}} >
          </g>
        </defs>
        <TimelineGenreHeader
          dynamicState={this.props.dynamicState}
          genreSplit={genreSplit}
          yOffset={-this.props.timelineBaselineY + this.props.upperUIPadding}
          headerWidth={this.props.timelineTotalWidth}
          colorScale={colorScale}
        />
        {tails}
        {planets}
        <SongTimelineAxis
          songData={this.props.songData}
          timelineXScale={timelineXScale}
        />
        <circle
          id={"glowingStar"}
          cx={0}
          cy={0}
          fill={"#fff"}
          r={8}
        />
      </g>
    )
  },

  componentDidMount() {
    var node = d3.select(this.getDOMNode())

    node.select('#energyTailFade')
      .attr('maskUnits', 'objectBoundingBox')
      .attr('maskContentUnits', 'objectBoundingBox')

    node.select('#glowingStar')
      .attr('filter', 'url(#starGlowFilter)')
  }

})

function getStarGlow() {
  return [
    '<filter x="-100%" y="-100%" width="300%" height="300%" id="starGlowFilter">',
      '<feGaussianBlur stdDeviation="8" result="BLUR_OUT" />',
      '<feMerge>',
        '<feMergeNode in="BLUR_OUT" />',
        '<feMergeNode in="SourceGraphic" />',
      '</feMerge>',
    '</filter>',
  ].join('')
}


module.exports = SongTimeline
