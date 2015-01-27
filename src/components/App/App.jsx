'use strict';

var React = require('react')
,   Immutable = require('Immutable')
,   ResizeMixin = require('components/ResizeMixin')

require('assets/icomoon/style.scss')
require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   AppHeader = require('components/AppHeader/AppHeader')
,   MainView = require('components/MainView/MainView')
,   GalaxyView = require('components/GalaxyView/GalaxyView')
,   DetailView = require('components/DetailView/DetailView')
,   Layout = require('components/Layout')

function getAppState() {
  return {appState: SongStore.getState()}
}

function sizesEqual(size1, size2) {
  if (size1 === size2) {
    return true
  } else if (size1 && size2) {
    return size1[0] === size2[0] && size1[1] === size2[1]
  }
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
    return !Immutable.is(this.state.appState, nextState.appState) || !sizesEqual(this.state.size, nextState.size)
  },

  render() {
    var songsArray = SongStore.getSongs()
    ,   detailData = SongStore.getDetailSongData()
    ,   galaxyScales = SongStore.getScales()
    ,   state = this.state.appState
    ,   genreCount = SongStore.getGenreCount()
    ,   componentLayout = Layout.getLayout()
    ,   displayObjects = SongStore.getDisplayObjects()

    return (
      <div className="AppBox">
        <AppHeader genreCount={genreCount} scales={galaxyScales} dynamicState={state} layout={componentLayout} />
        <MainView displayObjects={displayObjects} dynamicState={state} />
        {
        /*state.get('inDetail') ?
          <DetailView
            layout={componentLayout}
            dynamicState={state}
            scales={galaxyScales}
            songData={detailData}
          />
        :
          <GalaxyView
            layout={componentLayout}
            dynamicState={state}
            scales={galaxyScales}
            songs={songsArray}
          /> */
       }
      </div>
    )
  }

})

module.exports = App
