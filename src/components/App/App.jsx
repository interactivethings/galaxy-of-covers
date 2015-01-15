/**
 * @jsx React.DOM
 */

var React = require('react')
,   Immutable = require('Immutable')
,   ResizeMixin = require('../ResizeMixin')

require('assets/icomoon/style.scss')
require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   AppHeader = require('components/AppHeader/AppHeader')
,   MainView = require('components/App/MainView')

function getAppState() {
  return {appState: SongStore.getState()}
}

var App = React.createClass({

  mixings: [ ResizeMixin ],

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
    return !Immutable.is(this.state.appState, nextState.appState)
  },

  getWindowDimensions() {
    var width = window.innerWidth
    ,   height = window.innerHeight
    return {width, height}
  },

  render() {
    var stateRef = this.state.appState
    ,   dim = this.getWindowDimensions()
    ,   songsArray = stateRef.get('songs') || []
    ,   galaxyScales = stateRef.get('scales')
    ,   dynamicState = stateRef.get('dynamic')
    ,   componentSizes = {}

    if (!dynamicState.get('inDetail')) {
      componentSizes = {
        headerHeight: 60,
        bodyHeight: dim.height,
        footerHeight: 0
      }
    } else {
      componentSizes = {
        headerHeight: 60,
        bodyHeight: dim.height,
        footerHeight: dim.height * 1 / 5
      }
    }

    return (
      <div className="AppBox">
        <AppHeader dynamicState={dynamicState} {...componentSizes} />
        <MainView songs={songsArray} scales={galaxyScales} dynamicState={dynamicState} {...componentSizes} />
      </div>
    )
  }

})

module.exports = App
