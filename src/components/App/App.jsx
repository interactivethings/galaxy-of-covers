var React = require('react')
,   Immutable = require('Immutable')
,   ResizeMixin = require('components/ResizeMixin')

require('assets/icomoon/style.scss')
require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   AppHeader = require('components/AppHeader/AppHeader')
,   MainView = require('components/App/MainView')
,   Layout = require('components/Layout')

function getAppState() {
  return {appState: SongStore.getState()}
}

var App = React.createClass({

  mixins: [ ResizeMixin ],

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

  render() {
    var songsArray = SongStore.getSongs()
    ,   detailData = SongStore.getDetailSongData()
    ,   galaxyScales = SongStore.getScales()
    ,   dynamicState = SongStore.getDynamic()
    ,   genreCount = SongStore.getGenreCount()
    ,   componentLayout = Layout.getLayout()

    return (
      <div className="AppBox">
        <AppHeader genreCount={genreCount} scales={galaxyScales} dynamicState={dynamicState} layout={componentLayout} />
        <MainView songs={songsArray} detailData={detailData} scales={galaxyScales} dynamicState={dynamicState} layout={componentLayout} />
      </div>
    )
  }

})

module.exports = App
