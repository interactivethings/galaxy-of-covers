'use strict';

var LoadActions = require('actions/LoadActions')
,   AppDispatcher = require('dispatcher/AppDispatcher')
,   reqwest = require('reqwest')
,   {EventEmitter} = require('events')
,   _ = require('lodash')
,   Immutable = require('Immutable')
,   d3 = require('d3')

var DynamicStateStore = require('stores/DynamicStateStore')
,   Constants = require('stores/Constants')
,   DataUtil = require('util/datautil')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map({
  songs: [],
  scales: {},
  dynamic: DynamicStateStore.getState()
})

var SongStore = _.extend({}, EventEmitter.prototype, {

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
        action.data.forEach((songData) => {
          songData.id = DataUtil.songSystemId(songData)
          songData.versions.forEach((versionData) => {
            versionData.id = DataUtil.versionId(versionData)
            versionData.parsedDate = parseDate(versionData.date)
            versionData.genre = Math.round(Math.random() * 5);
          })
        })
        setState('songs', action.data)
        setState('scales', ScaleSet(findBounds(action.data)))
        break

      // action events
      // 'HOVER_SYSTEM', 'HOVER_OFF_SYSTEM', 'CLICK_SYSTEM', 'END_TRANSITION', 'SHOW_DETAIL', 'SHOW_GALAXY', etc...
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
  ,   genres = {}

  dataset.forEach((songData) => {
    songData.versions.forEach((versionData) => {
      if (versionData.echonest) {
        adjustBounds(energy, versionData.echonest.energy)
        adjustBounds(speechiness, versionData.echonest.speechiness)
      }
    })
  })

  return {
    energyRange: energy,
    speechinessRange: speechiness,
    genres: Object.keys(genres)
  }
}

function ScaleSet(bounds) {
  var orbitRadius = d3.time.scale().domain([new Date(1940, 1, 1), new Date()]).range([50, 200])
  ,   radius = d3.scale.linear().domain([0, 100]).range([3, 18])
  ,   color = d3.scale.ordinal().domain(bounds.genres).range(['#E5D166', '#9BC054', '#57BF93', '#5882B4', '#CD6586'])
  // rotation ranges from 270 to 450 degrees
  ,   rotation = d3.scale.linear().domain([0, 1]).range([270, 450])
  // rotation ranges from 0 to 360 degrees
//  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, 360])
  ,   speed = d3.scale.linear().domain(bounds.energyRange).range([0.5, 2.5])
  ,   timelineRadius = d3.scale.linear().domain([0, 100]).range([3, 50])
  ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([-1, 8, 7, 6, 5, 4, 3]) // reverse scale

  return {
    getOrbitRadiusScale: () => orbitRadius,
    getRadiusScale: () => radius,
    getColorScale: () => color,
    getRotationScale: () => rotation,
    getSpeedScale: () => speed,
    getTimelineRadiusScale: () => timelineRadius,
    getEdgesScale: () => edgesScale
  }
}

module.exports = SongStore
