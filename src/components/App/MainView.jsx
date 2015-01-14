/**
 * @jsx React.DOM
 */

var React = require('react')

var SongTimeline = require('components/SongTimeline/SongTimeline')
,   SongSystem = require('components/SongSystem/SongSystem')
,   ViewActions = require('actions/ViewActions')

var App = React.createClass({

  getGalaxyGroupDimensions(systemHeight, systemWidth, numSystems) {
    var width = window.innerWidth
    ,   height = systemHeight * Math.ceil(numSystems / Math.floor(width / systemWidth))
    return {width, height}
  },

  getWindowDimensions() {
    var width = window.innerWidth
    ,   height = window.innerHeight
    return {width, height}
  },

  onMouseLeave() {
    ViewActions.hoverOffSongSystem(this.props.id)
  },

  render() {
    if (this.props.dynamicState.get('inDetail')) {
      var dim = this.getWindowDimensions()
      ,   detailId = this.props.dynamicState.get('detailSystemId')
      ,   selectedSong = this.props.songs.filter((songData) => songData.id === detailId )[0]
      ,   timelineBaselineY = dim.height * 3 / 5
      ,   upperUIPadding = 60
      ,   leftTimelinePadding = 100

      return (
        <svg className="MainView SongDetail" {...dim} >
          <SongTimeline
            dynamicState={this.props.dynamicState}
            songData={selectedSong}
            scales={this.props.scales}
            timelineBaselineY={timelineBaselineY}
            upperUIPadding={upperUIPadding}
            timelineTotalWidth={dim.width}
            timelineXRange={[leftTimelinePadding, dim.width - leftTimelinePadding]}
          />
        </svg>
      )
    } else {
      var systemWidth = 400
      ,   systemHeight = 400
      ,   topPadding = 42 // currently, this is hardcoded, but it should be calculated dynamically, based on the size of the header bar
      ,   dim = this.getGalaxyGroupDimensions(systemHeight, systemWidth, this.props.songs.length)
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
