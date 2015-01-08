/**
 * @jsx React.DOM
 */

var React = require('react')

require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   SongSystem = require('components/SongSystem/SongSystem')
,   ViewActions = require('actions/ViewActions')

function getAppState() {
  return SongStore.getState()
}

function songSystemId(songData) {
  return songData.title + '-' + songData.artist
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

  getAppDimensions() {
    var width = window.innerWidth
    ,   height = width * 3
    return {width, height}
  },

  onMouseLeave() {
    ViewActions.hoverOffSongSystem(this.props.id)
  },

  render() {
    console.log(this.state.songs);

    var dim = this.getAppDimensions()
    ,   songsArray = this.state.songs || []
    ,   systemWidth = 400
    ,   systemHeight = 400
    ,   systemX = 0
    ,   systemY = 0

    dim.height = systemHeight * Math.ceil(songsArray.length / Math.floor(dim.width / systemWidth))

    var galaxyScales = this.state.scales
    ,   stateRef = this.state

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
          ,   shouldAnimate = systemId !== stateRef.dynamic.hoveredSystemId
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

})

module.exports = App
