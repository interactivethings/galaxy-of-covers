var React = require('react')
,   d3 = require('d3')

require('components/SongTimeline/SongTimeline.scss')

var SvgUtil = require('util/svgutil')
,   DataUtil = require('util/datautil')
,   Vec2 = require('svec2')
,   SongTimelineAxis = require('components/SongTimelineAxis/SongTimelineAxis')
,   TimelinePlanet = require('components/TimelinePlanet/TimelinePlanet')
,   TimelineEnergyTail = require('components/TimelinePlanet/TimelineEnergyTail')

var SongTimeline = React.createClass({

  render() {
    var highlineY = this.props.layout.timelineTop
    ,   baselineY = this.props.layout.timelineBase
    ,   timelineTop = highlineY + (baselineY - highlineY) * 1 / 5
    ,   timelineHeight = baselineY - timelineTop
    ,   energyRange = DataUtil.getMinMax(this.props.songData.versions, function(item) { return item.echonest ? item.echonest.energy : 0; })
    ,   timelineYScale = d3.scale.linear().domain(energyRange).range([timelineHeight, 0])
    ,   timeRange = DataUtil.getMinMax(this.props.songData.versions, (item) => item.parsedDate)
    ,   timelineXRange = [this.props.layout.timelineLeftRightPadding, this.props.layout.bodyWidth - this.props.layout.timelineLeftRightPadding]
    ,   timelineXScale = d3.time.scale().domain(timeRange).range(timelineXRange)
    ,   radiusScale = this.props.scales.getTimelineRadiusScale()
    ,   colorScale = this.props.scales.getColorScale()
    ,   edgesScale = this.props.scales.getEdgesScale()
    ,   rotationScale = this.props.scales.getTimelineRotation()

    var planets = []
    ,   tails = []
    ,   genreSplit = {}
    this.props.songData.versions.forEach(function(versionData, i) {
      if (!versionData.echonest) return;

      var g = versionData.genre
      if (!genreSplit[g]) genreSplit[g] = 0
      genreSplit[g]++

      // props for the representation of this song version
      var songProps = {
        baseY: timelineHeight,
        cx: timelineXScale(versionData.parsedDate),
        cy: timelineYScale(versionData.echonest.energy),
        r: radiusScale(versionData.spotify.popularity),
        color: colorScale(versionData.genre),
        sides: edgesScale(versionData.echonest.speechiness),
        rotation: rotationScale(versionData.echonest.valence)
      }

      songProps.isCircle = songProps.sides === -1

      // reorient the polygon and draw the correct energy tail for it
      if (!songProps.isCircle) {
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
        // draw the energy tail for a circle (no polygonPoints needed)
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
      <g className="SongTimeline" >
        <defs>
          <g dangerouslySetInnerHTML={{ __html: SvgUtil.getEnergyTailFade() }} />
          <g dangerouslySetInnerHTML={{ __html: SvgUtil.getStarGlow() }} />
        </defs>
        <g transform={SvgUtil.translateString(0, timelineTop)}>
          { __DEV__ ? <line x1={0} x2={this.props.layout.bodyWidth} stroke="#0ff" /> : null }
          {tails}
          {planets}
          <SongTimelineAxis
            transform={SvgUtil.translateString(0, timelineHeight)}
            songData={this.props.songData}
            timelineXScale={timelineXScale}
          />
          <circle
            id={"glowingStar"}
            cx={0}
            cy={timelineHeight}
            fill={"#fff"}
            r={8}
          />
        </g>
      </g>
    )
  },

  componentDidMount() {
    var node = d3.select(this.getDOMNode())

    node.select('#glowingStar')
      .attr('filter', 'url(#starGlowFilter)')
  }

})

module.exports = SongTimeline
