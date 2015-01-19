var React = require('react')

var SvgUtil = require('util/svgutil')
,   SongTimeline = require('components/SongTimeline/SongTimeline')
,   SongSystem = require('components/SongSystem/SongSystem')
,   ViewActions = require('actions/ViewActions')

var App = React.createClass({

  numRows(numSystems) {
    var n = 2 * Math.ceil(numSystems / 3)
    if (numSystems % 3 !== 0) n--
    return n
  },

  getGalaxyGroupDimensions(systemRadius, numSystems) {
    var width = window.innerWidth
    ,   height = 2 * systemRadius + this.numRows(numSystems) * (width / 4 * Math.tan(Math.PI / 3))
    return {width, height}
  },

  getSongInfoString(songInfo) {
    var timeDifference = (new Date()).getFullYear() - songInfo.versions[0].parsedDate.getFullYear()
    return songInfo.versions.length + ' covers / ' + timeDifference + ' years old'
  },

  render() {
    if (this.props.dynamicState.get('inDetail')) {
      // render the detail view
      var dim =
          { height: this.props.bodyHeight
          , width: window.innerWidth
          }
      ,   detailId = this.props.dynamicState.get('detailSystemId')
      ,   selectedSong = this.props.songs.filter((songData) => songData.id === detailId )[0]
      ,   timelineBaselineY = dim.height * 4 / 5
      ,   timelineHighlineY = this.props.dynamicState.get('legendOpen') ? this.props.headerHeight + this.props.legendHeight : this.props.headerHeight
      ,   leftTimelinePadding = 100

      var styleProps = {
        top: this.props.dynamicState.get('legendOpen') ? timelineHighlineY + 90 : '10em'
      }

      return (
        <div className="MainView">
          <div className="DetailTitle" style={styleProps} >
            <h2 className="DetailTitle--title">{selectedSong.title}</h2>
            <h3 className="DetailTitle--info">{this.getSongInfoString(selectedSong)}</h3>
          </div>
          <svg className="SongDetail" {...dim} >
            <SongTimeline
              dynamicState={this.props.dynamicState}
              songData={selectedSong}
              scales={this.props.scales}
              timelineBaselineY={timelineBaselineY}
              timelineHighlineY={timelineHighlineY}
              timelineTotalWidth={dim.width}
              timelineXRange={[leftTimelinePadding, dim.width - leftTimelinePadding]}
            />
          </svg>
        </div>
      )
    } else {
      // render the "galaxy" view
      var systemRadius = 300
      ,   topPadding = this.props.headerHeight
      ,   dim = this.getGalaxyGroupDimensions(systemRadius, this.props.songs.length)
      ,   horizontalSpacing = dim.width / 4
      ,   verticalSpacing = Math.max(horizontalSpacing * Math.tan(Math.PI / 3), systemRadius * Math.tan(Math.PI / 3))
      ,   hoveredId = this.props.dynamicState.get('hoveredSystemId')
      ,   scales = this.props.scales

      var systemY = topPadding + systemRadius
      return (
        <svg className="MainView SongGalaxy" {...dim} >
          <defs>
            <g dangerouslySetInnerHTML={{ __html: SvgUtil.getStarGlow() }} />
          </defs>
          {this.props.songs.map(function(songData, i) {
            var sx
            ,   sy = systemY
            ,   index = (i + 1) % 3
            if (index === 0) {
              sx = 2 * horizontalSpacing
              systemY += verticalSpacing
            } else if (index === 1) {
              sx = horizontalSpacing
            } else if (index === 2) {
              sx = 3 * horizontalSpacing
              systemY += verticalSpacing
            }

            var systemId = songData.id
            ,   shouldAnimate = systemId !== hoveredId
            return (
              <SongSystem
                id={systemId}
                animate={shouldAnimate}
                x={sx}
                y={sy}
                r={systemRadius}
                filter='url(#starGlowFilter)'
                songData={songData}
                scales={scales}
                key={songData.title}
              />
            )
          })}
        </svg>
      )
    }
  }

})

module.exports = App
