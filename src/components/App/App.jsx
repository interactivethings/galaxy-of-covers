'use strict';

var React = require('react')
,   Immutable = require('Immutable')
,   ResizeMixin = require('components/ResizeMixin')

require('assets/icomoon/style.scss')
require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   AppHeader = require('components/AppHeader/AppHeader')
,   DetailHeader = require('components/DetailView/DetailHeader')
,   MainView = require('components/MainView/MainView')
,   Layout = require('components/Layout')
,   DataUtil = require('util/datautil')

function getAppState() {
  return {
    appState: SongStore.getState(),
    scrollY: window.pageYOffset
  }
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

  setViewportScroll() {
    if (!this.state.appState.get('inDetail')) {
      this.setState({
        scrollY: window.pageYOffset
      })
    }
  },

  componentDidMount() {
    SongStore.onChange(this.handleChange)
    LoadActions.initialLoad()

    window.addEventListener('scroll', DataUtil.throttle(this.setViewportScroll, 400))
  },

  componentWillUnmount() {
    SongStore.removeChangeHandler(this.handleChange)
  },

  render() {
    var displayObjects = SongStore.getDisplayObjects()
    ,   detailData = SongStore.getDetailSongData()
    ,   galaxyScales = SongStore.getScales()
    ,   state = this.state.appState
    ,   scrollY = this.state.scrollY
    ,   genreCount = SongStore.getGenreCount()
    ,   componentLayout = Layout.getLayout()

    return (
      <div className="AppBox">
        <AppHeader genreCount={genreCount} scales={galaxyScales} dynamicState={state} layout={componentLayout} />
        {state.get('inDetail') ? <DetailHeader songData={detailData} state={state} layout={componentLayout} /> : null}
        <MainView displayObjects={displayObjects} dynamicState={state} scrollY={scrollY} />
      </div>
    )
  }

})

module.exports = App
