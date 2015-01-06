/**
 * @jsx React.DOM
 */

var React = require('react')

require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   SongSystem = require('components/SongSystem/SongSystem')

function getAppState() {
  return {
    songs: SongStore.getSongs()
  }
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

    dim.height = systemYPad + systemHeight * (Math.floor(songsArray.length / Math.floor((dim.width - systemXPad) / systemWidth)) - 1)

    return (
      <svg className="SongGalaxy" {...dim} >
        {songsArray.map(function(songData, i) {
          if (systemX >= dim.width) {
            systemX = systemXPad
            systemY += systemHeight
          }
          var x = systemX
          systemX += systemWidth

          return <SongSystem x={x} y={systemY} w={systemWidth} h={systemHeight} songData={songData} key={songData.title} />
        })}
      </svg>
    )
  }
})

module.exports = App
