/**
 * @jsx React.DOM
 */

var React = require('react')
,   Immutable = require('Immutable')

require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   ViewActions = require('actions/ViewActions')
,   AppHeader = require('components/AppHeader/AppHeader')
,   MainView = require('components/App/MainView')
,   AppFooter = require('components/AppFooter/AppFooter')

function getAppState() {
  return {appState: SongStore.getState()}
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

  onMouseLeave() {
    ViewActions.hoverOffSongSystem(this.props.id)
  },

  render() {
    var stateRef = this.state.appState
    ,   songsArray = stateRef.get('songs') || []
    ,   galaxyScales = stateRef.get('scales')
    ,   dynamicState = stateRef.get('dynamic')

    return (
      <div className="AppBox">
        <AppHeader />
        <MainView songs={songsArray} scales={galaxyScales} dynamic={dynamicState} />
        <AppFooter />
      </div>
    )
  }

})

module.exports = App
