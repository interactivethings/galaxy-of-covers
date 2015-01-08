/**
 * @jsx React.DOM
 */

var React = require('react')
,   Immutable = require('Immutable')

require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   SongSystem = require('components/SongSystem/SongSystem')
,   ViewActions = require('actions/ViewActions')
,   SongTimeline = require('components/SongTimeline/SongTimeline')

function getAppState() {
  return {appState: SongStore.getState()}
}

function songSystemId(songData) {
  return songData.uri
}

var App = React.createClass({

  getInitialState() {
    return getAppState()
  },

  handleChange() {
    this.setState(getAppState())
  },

  componentDidMount() {
    SongStore.onChange(this.handleChange)
    LoadActions.initialLoad()
  },

  componentWillUnmount() {
    SongStore.removeChangeHandler(this.handleChange)
  },

  shouldComponentUpdate(nextProps, nextState) {
    return !Immutable.is(this.state.appState, nextState.appState);
  },

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
    var stateRef = this.state.appState
    ,   songsArray = stateRef.get('songs') || []
    ,   galaxyScales = stateRef.get('scales')

    if (stateRef.get('dynamic').get('inDetail')) {
      var dim = this.getWindowDimensions()
      ,   detailId = stateRef.get('dynamic').get('detailSystemId')
      ,   selectedSong = songsArray.filter((songData) => songSystemId(songData) === detailId )[0]
      ,   timelineBaselineY = dim.height * 3 / 5
      ,   upperUIPadding = 120
      ,   leftTimelinePadding = 260

      return (
        <svg className="SongDetail" {...dim} >
          <SongTimeline
            songData={selectedSong}
            scales={galaxyScales}
            timelineBaselineY={timelineBaselineY}
            timelineXRange={[leftTimelinePadding, dim.width - leftTimelinePadding]}
            timelineYRange={[0, - timelineBaselineY + upperUIPadding]}
          />
        </svg>
      )
    } else {
      var systemWidth = 400
      ,   systemHeight = 400
      ,   dim = this.getGalaxyGroupDimensions(systemHeight, systemWidth, songsArray.length)
      ,   hoveredId = stateRef.get('dynamic').get('hoveredSystemId')
      ,   systemX = 0
      ,   systemY = 0

      return (
        <svg className="SongGalaxy" {...dim} onMouseLeave={this.onMouseLeave} >
          {songsArray.map(function(songData, i) {
            if (systemX + systemWidth >= dim.width) {
              systemX = 0
              systemY += systemHeight
            }
            var x = systemX
            systemX += systemWidth

            var systemId = songSystemId(songData)
            ,   shouldAnimate = systemId !== hoveredId
            return <SongSystem
                    id={systemId}
                    animate={shouldAnimate}
                    x={x}
                    y={systemY}
                    w={systemWidth}
                    h={systemHeight}
                    songData={songData}
                    scales={galaxyScales}
                    key={songData.title}
                  />
          })}
        </svg>
      )
    }
  }

})

module.exports = App
