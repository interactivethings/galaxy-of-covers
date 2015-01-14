/**
 * @jsx React.DOM
 */

var React = require('react')
,   Immutable = require('Immutable')

require('assets/icomoon/style.scss')
require('components/App/App.scss');

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
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

  render() {
    var stateRef = this.state.appState
    ,   songsArray = stateRef.get('songs') || []
    ,   galaxyScales = stateRef.get('scales')
    ,   dynamicState = stateRef.get('dynamic')

    return (
      <div className="AppBox">
        <AppHeader dynamicState={dynamicState} />
        <MainView songs={songsArray} scales={galaxyScales} dynamicState={dynamicState} />
        <AppFooter dynamicState={dynamicState} />
      </div>
    )
  }

})

module.exports = App
