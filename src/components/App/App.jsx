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
    ,   hoveredId = stateRef.get('dynamic').get('hoveredSystemId')
    ,   systemWidth = 400
    ,   systemHeight = 400
    ,   systemX = 0
    ,   systemY = 0

    if (stateRef.get('dynamic').get('inDetail')) {
      var dim = this.getWindowDimensions()
      return (
        <svg className="SongDetail" {...dim} >
        </svg>
      )
    } else {
      var dim = this.getGalaxyGroupDimensions(systemHeight, systemWidth, songsArray.length)
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
