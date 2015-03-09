'use strict';

var React = require('react')
,   Immutable = require('Immutable')

require('assets/icomoon/style.scss')
require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   AppHeader = require('components/AppHeader/AppHeader')
,   DetailHeader = require('components/DetailView/DetailHeader')
,   MainView = require('components/MainView/MainView')
,   Layout = require('components/Layout')
,   DataUtil = require('util/datautil')

function sizesEqual(size1, size2) {
  if (size1 === size2) {
    return true
  } else if (size1 && size2) {
    return size1[0] === size2[0] && size1[1] === size2[1]
  }
}

var App = React.createClass({

  getInitialState() {
    return {
      appState: SongStore.getState(),
      scrollY: window.pageYOffset
    }
  },

  handleChange() {
    this.setState({
      appState: SongStore.getState()
    })
  },

  setViewportScroll() {
    if (!this.state.appState.get('inDetail')) {
      this.setState({
        scrollY: window.pageYOffset
      })
    }
  },

  onWindowResize() {
    this.setState({
      windowSize: [window.innerWidth, window.innerHeight]
    })
  },

  componentDidMount() {
    SongStore.onChange(this.handleChange)
    LoadActions.initialLoad()

    window.addEventListener('scroll', DataUtil.throttle(this.setViewportScroll, 400))
    window.addEventListener('resize', this.onWindowResize);
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
    ,   genreList = SongStore.getGenreList()
    ,   componentLayout = Layout.getLayout()

    return (
      <div className="AppBox">
        <AppHeader genreCount={genreCount} genreList={genreList} scales={galaxyScales} dynamicState={state} layout={componentLayout} />
        {state.get('inDetail') ? <DetailHeader songData={detailData} state={state} layout={componentLayout} /> : null}
        <MainView displayObjects={displayObjects} dynamicState={state} scrollY={scrollY} />
      </div>
    )
  }

})

module.exports = App
