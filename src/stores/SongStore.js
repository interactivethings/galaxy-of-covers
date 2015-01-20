'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher')
,   reqwest = require('reqwest')
,   {EventEmitter} = require('events')
,   LoadActions = require('actions/LoadActions')
,   Immutable = require('Immutable')
,   d3 = require('d3')

var DynamicStateStore = require('stores/DynamicStateStore')
,   DataUtil = require('util/datautil')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map({
  songs: [],
  scales: {},
  dynamic: DynamicStateStore.getState(),
  genreCount: {}
})

var SongStore = DataUtil.extend({}, EventEmitter.prototype, {

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

  getScales() {
    return state.get('scales')
  },

  getGenreCount() {
    return state.get('genreCount')
  },

  getState() {
    return state
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
        var genreCounter = {}
        action.data.forEach((songData) => {
          songData.id = DataUtil.songSystemId(songData)
          songData.versions.forEach((versionData) => {
            versionData.id = DataUtil.versionId(versionData)
            versionData.parsedDate = parseDate(versionData.date)
            // genres sourced from: http://www.furia.com/page.cgi?type=log&id=427
            // versionData.genre = ['Metropopolis', 'Laboratorio', 'More Deeper House', 'Fallen Angel', 'Permanent Wave'][Math.floor(Math.random() * 5)]
            var genre
            if (versionData.musiXmatch && versionData.musiXmatch.genres && versionData.musiXmatch.genres.length > 0) {
              genre = versionData.musiXmatch.genres[0]
            } else {
              genre = 'Unknown'
            }
            versionData.genre = genre
            if (!genreCounter[genre]) genreCounter[genre] = 0
            genreCounter[genre]++
          })
        })
        setState('songs', action.data)
        setState('scales', ScaleSet(findBounds(action.data)))
        setState('genreCount', genreCounter)
        break

      // view action events
      default:
        DynamicStateStore.handleAction(action)
        setState('dynamic', DynamicStateStore.getState())
    }

    SongStore.emitChange()
  })

})

function loadSongs() {
  reqwest({
    url: 'data/out/songinfo-spotify-echonest-genres.json',
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

function ScaleSet(bounds) {
  var orbitRadius = d3.time.scale().domain([new Date(1931, 1, 1), new Date()]).range([10, 300])
  ,   radius = d3.scale.linear().domain([0, 100]).range([3, 18])
  ,   color = d3.scale.ordinal().domain(bounds.genres).range(['#E5D166', '#9BC054', '#57BF93', '#5882B4', '#CD6586'])
  // rotation ranges from 270 to 450 degrees
  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, -90])
  ,   timelineRotation = d3.scale.linear().domain([0, 1]).range([0, -90])
  // rotation ranges from 0 to 360 degrees
//  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, 360])
  ,   speed = d3.scale.linear().domain(bounds.energyRange).range([0.5, 2.5])
  ,   timelineRadius = d3.scale.linear().domain([0, 100]).range([3, 50])
  ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([-1, 8, 7, 6, 5, 4, 3]) // reverse scale
//  ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([6])
  ,   blinkScale = d3.scale.linear().domain(bounds.tempoRange).range([2, 14])

  return {
    getOrbitRadiusScale: () => orbitRadius,
    getRadiusScale: () => radius,
    getColorScale: () => color,
    getRotationScale: () => rotation,
    getSpeedScale: () => speed,
    getTimelineRadiusScale: () => timelineRadius,
    getEdgesScale: () => edgesScale,
    getTimelineRotation: () => timelineRotation,
    getBlinkScale: () => blinkScale
  }
}

module.exports = SongStore
