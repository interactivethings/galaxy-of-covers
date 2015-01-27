'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher')
,   reqwest = require('reqwest')
,   {EventEmitter} = require('events')
,   LoadActions = require('actions/LoadActions')
,   Immutable = require('Immutable')
,   d3 = require('d3')

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
  detailTransitionId: null,
  detailSystemId: null,
  inTransition: false,
  inDetail: false,
  shareOpen: false,
  legendOpen: false,
  aboutOpen: false,
  highlightedAttribute: null,
  filteredGenres: Immutable.Map()
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

  getSongs() {
    return state.get('songs')
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

  getDetailGenreCount() {
    var songData = state.get('detailSongData')
    return songData.versions.reduce((memo, versionData) => {
      var genre = versionData.genre
      if (!memo[genre]) memo[genre] = 0
      memo[genre]++
      return memo
    }, {})
  },

  setHoveredSystem(id) {
    setState('hoveredSystemId', id)
  },

  transitionToDetail(id) {
    setStateObj({
      inTransition: true,
      detailTransitionId: id
    })
  },

  showDetail(id) {
    setStateObj({
      inTransition: false,
      detailSystemId: id,
      inDetail: true
    })
  },

  showGalaxy() {
    setStateObj({
      hoveredSystemId: null,
      inTransition: false,
      detailTransitionId: null,
      detailSystemId: null,
      inDetail: false
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
    var filter = state.get('filteredGenres')
    if (filter.get(genre)) filter = filter.set(genre, false)
    else filter = filter.set(genre, true)
    setState('filteredGenres', filter)
  },

  handleAction(payload) {
    var {action} = payload;

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
        prepDetailData(action.systemId)
        this.showDetail(action.systemId)
        break
      case 'SHOW_GALAXY':
        noDetailData()
        this.showGalaxy()
        break
      case 'HOVER_SYSTEM':
        if (!state.get('inTransition')) {
          this.setHoveredSystem(action.systemId)
        }
        break
      case 'HOVER_OFF_SYSTEM':
        this.setHoveredSystem(null)
        break
      case 'CLICK_SYSTEM':
        if (!state.get('inTransition')) {
          this.transitionToDetail(action.systemId)
        }
        break
      case 'END_TRANSITION':
        setState('inTransition', false)
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
      case 'FILTER_GENRE':
        this.toggleFilteredGenre(action.genre)
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
  var displayObjects = dataset.map((songData) => {
    return {
      title: songData.title,
      songId: songData.id,
      galaxyX: 0,
      galaxyY: 0,
      versions: songData.versions.map((versionData) => {
        return {
          songId: songData.id,
          versionId: versionData.id,
          galaxyX: 0,
          galaxyY: 0,
          orbitRadiusX: scaleset.getOrbitRadiusScale()(versionData.parsedDate),
          orbitRadiusY: scaleset.getOrbitRadiusScale()(versionData.parsedDate) * 3 / 5,
          galaxyPlanetRadius: scaleset.getRadiusScale()(versionData.spotify.popularity),
          timelinePlanetRadius: scaleset.getTimelineRadiusScale()(versionData.spotify.popularity),
          genreColor: scaleset.getColorScale()(versionData.genre),
          orbitRotationOffset: scaleset.getRotationScale()(versionData.echonest.valence),
          orbitSpeed: scaleset.getSpeedScale()(versionData.echonest.energy),
          blinkSpeed: scaleset.getBlinkScale()(versionData.echonest.tempo),
          numSides: scaleset.getEdgesScale()(versionData.echonest.speechiness),
          isCircle: scaleset.getEdgesScale()(versionData.echonest.speechiness) === -1,
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

function prepDetailData(detailId) {
  var selectedSong = state.get('songs').filter((songData) => songData.id === detailId )[0]
  setState('detailSongData', selectedSong)
}

function noDetailData() {
  setState('detailSongData', {})
}

module.exports = SongStore
