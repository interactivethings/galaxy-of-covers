var React = require('react')

var SongTimeline = require('components/SongTimeline/SongTimeline')
,   SongSystem = require('components/SongSystem/SongSystem')
,   ViewActions = require('actions/ViewActions')

var App = React.createClass({

  getGalaxyGroupDimensions(systemHeight, systemWidth, topPadding, numSystems) {
    var width = window.innerWidth
    ,   height = systemHeight * Math.ceil(numSystems / Math.floor(width / systemWidth)) + topPadding
    return {width, height}
  },

  onMouseLeave() {
    ViewActions.hoverOffSongSystem(this.props.id)
  },

  getSongInfoString(songInfo) {
    var timeDifference = (new Date()).getFullYear() - songInfo.versions[0].parsedDate.getFullYear()
    return songInfo.versions.length + ' covers / ' + timeDifference + ' years old'
  },

  render() {
    if (this.props.dynamicState.get('inDetail')) {
      // render the detail view
      var dim = {
            height: this.props.bodyHeight,
            width: window.innerWidth
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
      var systemWidth = 600
      ,   systemHeight = 600
      ,   topPadding = this.props.headerHeight
      ,   dim = this.getGalaxyGroupDimensions(systemHeight, systemWidth, topPadding, this.props.songs.length)
      ,   hoveredId = this.props.dynamicState.get('hoveredSystemId')
      ,   systemX = 0
      ,   systemY = topPadding
      ,   scales = this.props.scales

      return (
        <svg className="MainView SongGalaxy" {...dim} onMouseLeave={this.onMouseLeave} >
          {this.props.songs.map(function(songData, i) {
            if (systemX + systemWidth >= dim.width) {
              systemX = 0
              systemY += systemHeight
            }
            var x = systemX
            systemX += systemWidth

            var systemId = songData.id
            ,   shouldAnimate = systemId !== hoveredId
            return (
              <SongSystem
                id={systemId}
                animate={shouldAnimate}
                x={x}
                y={systemY}
                w={systemWidth}
                h={systemHeight}
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
