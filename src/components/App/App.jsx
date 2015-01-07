/**
 * @jsx React.DOM
 */

var React = require('react')

require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   SongSystem = require('components/SongSystem/SongSystem')

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

  render() {
    console.log(this.state.songs);

    var dim = this.getAppDimensions()
    ,   songsArray = this.state.songs || []
    ,   systemXPad = 200
    ,   systemYPad = 200
    ,   systemWidth = 400
    ,   systemHeight = 400
    ,   systemX = systemXPad
    ,   systemY = systemYPad

    dim.height = systemYPad + systemHeight * Math.floor(songsArray.length / Math.floor((dim.width - systemXPad) / systemWidth))

    var galaxyScales = this.state.scales
    ,   stateRef = this.state

    return (
      <svg className="SongGalaxy" {...dim} >
        {songsArray.map(function(songData, i) {
          if (systemX >= dim.width) {
            systemX = systemXPad
            systemY += systemHeight
          }
          var x = systemX
          systemX += systemWidth

          var systemId = songSystemId(songData)
          ,   shouldAnimate = systemId !== stateRef.hoveredSystemId
          return <SongSystem id={systemId} animate={shouldAnimate} x={x} y={systemY} w={systemWidth} h={systemHeight} songData={songData} scales={galaxyScales} key={songData.title} />
        })}
      </svg>
    )
  }

})

module.exports = App
