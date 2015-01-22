var React = require('react')
,   Immutable = require('Immutable')
,   ResizeMixin = require('components/ResizeMixin')

require('assets/icomoon/style.scss')
require('components/App/App.scss')

var LoadActions = require('actions/LoadActions')
,   SongStore = require('stores/SongStore')
,   AppHeader = require('components/AppHeader/AppHeader')
,   GalaxyView = require('components/GalaxyView/GalaxyView')
,   DetailView = require('components/DetailView/DetailView')
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
    return !Immutable.is(this.state.appState, nextState.appState) || (this.state.size !== nextState.size)
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
        {dynamicState.get('inDetail') ?
          <DetailView
            layout={componentLayout}
            dynamicState={dynamicState}
            scales={galaxyScales}
            songData={detailData}
          />
        :
          <GalaxyView
            layout={componentLayout}
            dynamicState={dynamicState}
            scales={galaxyScales}
            songs={songsArray}
          />
        }
      </div>
    )
  }

})

module.exports = App
