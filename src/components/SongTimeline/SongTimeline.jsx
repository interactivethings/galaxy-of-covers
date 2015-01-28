var React = require('react')
,   d3 = require('d3')

require('components/SongTimeline/SongTimeline.scss')

var SvgUtil = require('util/svgutil')
,   DataUtil = require('util/datautil')
,   Vec2 = require('svec2')
,   SongTimelineAxis = require('components/SongTimeline/SongTimelineAxis')
,   TimelinePlanet = require('components/SongTimeline/SongTimelinePlanet')
,   TimelineEnergyTail = require('components/SongTimeline/SongTimelineEnergyTrail')

var SongTimeline = React.createClass({

  render() {


    var planets = []
    ,   tails = []
    this.props.songData.versions.forEach(function(versionData, i) {



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
          {/* __DEV__ ? <line x1={0} x2={this.props.layout.bodyWidth} stroke="#0ff" /> : null */}
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
