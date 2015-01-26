'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher')
,   reqwest = require('reqwest')
,   {EventEmitter} = require('events')
,   LoadActions = require('actions/LoadActions')
,   Immutable = require('Immutable')
,   d3 = require('d3')

var Constants = require('Constants')
,   DynamicStateStore = require('stores/DynamicStateStore')
,   DataUtil = require('util/datautil')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map()

// properties should all be mutable objects
setStateObj({
  songs: [],
  detailSongData: {},
  scales: null,
  dynamicState: DynamicStateStore.getState(),
  allGenresCount: {}
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

  getDynamic() {
    return state.get('dynamicState')
  },

  getGenreCount() {
    if (!DynamicStateStore.isInDetail()) {
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

  dispatcherToken: AppDispatcher.register((payload) => {
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
      case 'SHOW_DETAIL':
        prepDetailData(action.systemId)
        updateDynamicState(action)
        break
      case 'SHOW_GALAXY':
        noDetailData()
        updateDynamicState(action)

      // view action events
      default:
        updateDynamicState(action)
    }

    SongStore.emitChange()
  })

})

function loadSongs() {
  reqwest({
    url: Constants.DATA_URL,
    type: 'json',
    contentType: 'application/json',
    success: (data) => { LoadActions.dataLoaded(data) }
  })
}

var monthDayYear = d3.time.format('%B %e, %Y')
,   monthYear = d3.time.format('%B %Y')
,   year = d3.time.format('%Y')

function parseDate(dateString) {
  return monthDayYear.parse(dateString) || monthYear.parse(dateString) || year.parse(dateString)
}

function baseBounds() {
  return [Infinity, -Infinity]
}

function adjustBounds(bounds, value) {
  bounds[0] = Math.min(bounds[0], value);
  bounds[1] = Math.max(bounds[1], value);
}

function findBounds(dataset) {
  var energy = baseBounds()
  ,   speechiness = baseBounds()
  ,   tempo = baseBounds()
  ,   genres = {}

  dataset.forEach((songData) => {
    songData.versions.forEach((versionData) => {
      if (versionData.echonest) {
        adjustBounds(energy, versionData.echonest.energy)
        adjustBounds(speechiness, versionData.echonest.speechiness)
        adjustBounds(tempo, versionData.echonest.tempo)
        genres[versionData.genre] = true
      }
    })
  })

  return {
    energyRange: energy,
    speechinessRange: speechiness,
    tempoRange: tempo,
    genres: Object.keys(genres).sort()
  }
}

function makeScaleSet(bounds) {
  var orbitRadius = d3.time.scale().domain([new Date(1929, 1, 1), new Date()]).range([4, Constants.SYSTEM_WIDTH])
  ,   planetRadius = d3.scale.linear().domain([0, 100]).range([3, 18])
  ,   planetColor = d3.scale.ordinal().domain(bounds.genres).range(['#E5D166', '#9BC054', '#57BF93', '#5882B4', '#CD6586'])
  // rotation ranges from 270 to 450 degrees
  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, -90])
  ,   timelineRotation = d3.scale.linear().domain([0, 1]).range([0, -90])
  // rotation ranges from 0 to 360 degrees
//  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, 360])
  ,   speed = d3.scale.linear().domain(bounds.energyRange).range([0.5 / 600, 2.5 / 600])
  ,   timelinePlanetRadius = d3.scale.linear().domain([0, 100]).range([3, 50])
  ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([-1, 8, 7, 6, 5, 4, 3]) // reverse scale
//  ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([6])
  ,   blinkScale = d3.scale.linear().domain(bounds.tempoRange).range([2 / 600, 14 / 600])

  return {
    getOrbitRadiusScale: () => orbitRadius,
    getRadiusScale: () => planetRadius,
    getColorScale: () => planetColor,
    getRotationScale: () => rotation,
    getSpeedScale: () => speed,
    getTimelineRadiusScale: () => timelinePlanetRadius,
    getEdgesScale: () => edgesScale,
    getTimelineRotation: () => timelineRotation,
    getBlinkScale: () => blinkScale
  }
}

function prepareLoadedData(dataset) {
  var allGenresCounter = {}
  dataset.forEach((songData) => {
    songData.id = DataUtil.songSystemId(songData)
    songData.versions.forEach((versionData) => {
//      versionData.id = DataUtil.versionId(versionData)
      versionData.parsedDate = parseDate(versionData.date)
      var genre = versionData.genre || "Unknown"
      if (!allGenresCounter[genre]) allGenresCounter[genre] = 0
      allGenresCounter[genre]++
      versionData.genre = genre
    })
  })
  setState('songs', dataset)
  var scaleset = makeScaleSet(findBounds(dataset))
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

function updateDynamicState(action) {
  DynamicStateStore.handleAction(action)
  setState('dynamicState', DynamicStateStore.getState())
}

function prepDetailData(detailId) {
  var selectedSong = state.get('songs').filter((songData) => songData.id === detailId )[0]
  setState('detailSongData', selectedSong)
}

function noDetailData() {
  setState('detailSongData', {})
}

module.exports = SongStore
