'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher')
,   reqwest = require('reqwest')
,   {EventEmitter} = require('events')
,   LoadActions = require('actions/LoadActions')
,   Immutable = require('Immutable')

var Constants = require('Constants')
,   DataUtil = require('util/datautil')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map()

// properties should all be mutable objects
setStateObj({
  songs: [],
  detailSongData: {},
  scales: null,
  allGenresCount: {},
  displayObjects: {},
  hoveredSystemId: null,
  inGalaxy: true,
  inDetail: false,
  shareOpen: false,
  legendOpen: false,
  aboutOpen: false,
  highlightedAttribute: null,
  filteredGenre: null,
  genreList: [],
  detailOverlay: null
})

var SongStore = DataUtil.extend({}, EventEmitter.prototype, {

  getState() {
    return state
  },

  emitChange() {
    this.emit('change')
  },

  onChange(handler) {
    this.on('change', handler)
  },

  removeChangeHandler(handler) {
    this.removeListener('change', handler)
  },

  getDetailSongData() {
    return state.get('detailSongData')
  },

  getScales() {
    return state.get('scales')
  },

  getDisplayObjects() {
    return state.get('displayObjects')
  },

  getGenreCount() {
    if (!state.get('inDetail')) {
      return state.get('allGenresCount')
    } else {
      return this.getDetailGenreCount()
    }
  },

  getGenreList() {
    return state.get('genreList')
  },

  getDetailGenreCount() {
    var songData = state.get('detailSongData')
    return songData.versions.reduce((memo, versionData) => {
      var genre = versionData.genreName
      if (!memo[genre]) memo[genre] = 0
      memo[genre]++
      return memo
    }, {})
  },

  setHoveredSystem(id) {
    setState('hoveredSystemId', id)
  },

  showDetail(songId) {
    var selectedSong = state.get('displayObjects').filter((songData) => songData.songId === songId )[0] || {}
    setStateObj({
      detailSongData: selectedSong,
      inDetail: true,
      inGalaxy: false
    })
  },

  showGalaxy() {
    setStateObj({
      detailSongData: {},
      hoveredSystemId: null,
      inDetail: false,
      inGalaxy: true
    })
  },

  navMenuToggle(optionName, isOpen) {
    // toggling any of the three automatically closes the other two
    var optionProps = {
      shareOpen: false,
      legendOpen: false,
      aboutOpen: false
    }
    optionProps[optionName] = isOpen
    setStateObj(optionProps)
  },

  toggleFilteredGenre(genre) {
    if (state.get('filteredGenre') === genre) genre = null
    setState('filteredGenre', genre)
  },

  showDetailOverlay(data) {
    setState('detailOverlay', data)
  },

  hideDetailOverlay() {
    setState('detailOverlay', null)
  },

  handleAction(payload) {
    var {action} = payload

    switch (action.type) {
      // load/network events
      case 'LOAD_SONG_DATA':
        loadSongs()
        break
      case 'SONGS_LOADED':
console.log('songs loaded', action.data);
        prepareLoadedData(action.data)
        break
      // view actions
      case 'SHOW_DETAIL':
        this.showDetail(action.systemId)
        break
      case 'SHOW_GALAXY':
        this.showGalaxy()
        break
      case 'HOVER_SYSTEM':
        this.setHoveredSystem(action.systemId)
        break
      case 'HOVER_OFF_SYSTEM':
        this.setHoveredSystem(null)
        break
      case 'OPEN_SHARE':
        this.navMenuToggle('shareOpen', true)
        break
      case 'CLOSE_SHARE':
        this.navMenuToggle('shareOpen', false)
        break
      case 'LEGEND_SHOW':
        this.navMenuToggle('legendOpen', true)
        break
      case 'LEGEND_HIDE':
        this.navMenuToggle('legendOpen', false)
        break
      case 'ABOUT_HIDE':
        this.navMenuToggle('aboutOpen', false)
        break
      case 'ABOUT_SHOW':
        this.navMenuToggle('aboutOpen', true)
        break
      case 'ATTRIBUTE_HIGHLIGHT':
        if (state.get('highlightedAttribute') === action.attributeToHighlight) {
          setState('highlightedAttribute', null)
        } else {
          setState('highlightedAttribute', action.attributeToHighlight)
        }
        break
      case 'FILTER_GENRE':
        this.toggleFilteredGenre(action.genre)
        break
      case 'HOVER_VERSION':
        this.showDetailOverlay(action.versionData)
        break
      case 'HOVER_OFF_VERSION':
        this.hideDetailOverlay()
        break
    }

    this.emitChange()
  }

})

SongStore.dispatcherToken = AppDispatcher.register(SongStore.handleAction.bind(SongStore))

function loadSongs() {
  reqwest({
    url: Constants.DATA_URL,
    type: 'json',
    contentType: 'application/json',
    success: (data) => { LoadActions.dataLoaded(data) }
  })
}

function prepareLoadedData(dataset) {
  var allGenresCounter = {}
  dataset.forEach((songData) => {
    songData.id = DataUtil.songSystemId(songData)
    songData.versions.forEach((versionData) => {
//      versionData.id = DataUtil.versionId(versionData)
      versionData.parsedDate = DataUtil.parseDate(versionData.date)
      var genre = versionData.genre || "Unknown"
      if (!allGenresCounter[genre]) allGenresCounter[genre] = 0
      allGenresCounter[genre]++
      versionData.genre = genre
    })
  })
  setState('songs', dataset)
  var scaleset = DataUtil.makeScaleSet(DataUtil.findBounds(dataset))
  setState('scales', scaleset)
  setState('allGenresCount', allGenresCounter)
  setState('genreList', scaleset.getColorScale().domain())
  var displayObjects = dataset.map((songData) => {
    return {
      title: songData.title,
      songId: songData.id,
      galaxyX: 0,
      galaxyY: 0,
      systemIsHovered: false,
      versionsFilteredIn: [],
      isInViewport: true,
      versions: songData.versions.map((versionData) => {
        return {
          songId: songData.id,
          versionTitle: versionData.title,
          versionId: versionData.id,
          songYear: versionData.parsedDate ? versionData.parsedDate.getFullYear() : null,
          spotify: versionData.spotify,
          echonest: versionData.echonest,
          galaxyX: 0,
          galaxyY: 0,
          stopAnimation: false,
          pauseAnimation: false,
          animationTime: 0,
          orbitRadiusX: scaleset.getOrbitRadiusScale()(versionData.parsedDate),
          orbitRadiusY: scaleset.getOrbitRadiusScale()(versionData.parsedDate) * 3 / 5,
          galaxyPlanetRadius: scaleset.getRadiusScale()(versionData.spotify.popularity),
          timelinePlanetRadius: scaleset.getTimelineRadiusScale()(versionData.spotify.popularity),
          genreName: versionData.genre,
          genreColor: scaleset.getColorScale()(versionData.genre),
          orbitRotationOffset: scaleset.getRotationScale()(versionData.echonest.valence),
          orbitRotationOffsetCos: Math.cos(scaleset.getRotationScale()(versionData.echonest.valence) * Math.PI / 180),
          orbitRotationOffsetSin: Math.sin(scaleset.getRotationScale()(versionData.echonest.valence) * Math.PI / 180),
          orbitSpeed: scaleset.getSpeedScale()(versionData.echonest.energy),
          blinkSpeed: scaleset.getBlinkScale()(versionData.echonest.tempo),
          numSides: scaleset.getEdgesScale()(versionData.echonest.speechiness),
          isCircle: scaleset.getEdgesScale()(versionData.echonest.speechiness) === -1,
          energy: versionData.echonest.energy,
          parsedDate: versionData.parsedDate,
          timelineCX: 0,
          timelineCY: 0,
          timelineBaseY: 0,
          timelineRotation: scaleset.getTimelineRotation()(versionData.echonest.valence),
          polygonPoints: null,
          tailpt1: 0,
          tailpt2: 0
        }
      })
    }
  })
  setState('displayObjects', displayObjects)
}

module.exports = SongStore
