var LoadActions = require('actions/LoadActions')
,   AppDispatcher = require('dispatcher/AppDispatcher')
,   reqwest = require('reqwest')
,   {EventEmitter} = require('events')
,   _ = require('lodash')
,   Immutable = require('Immutable')
,   d3 = require('d3')

var state = Immutable.Map()
state.set('songs', [])
state.set('scales', {})

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

  dispatcherToken: AppDispatcher.register((payload) => {
    var {action} = payload;

    switch (action.type) {
      case 'LOAD_SONG_DATA':
        loadSongs()
        break
      case 'SONGS_LOADED':
        setState('songs', action.data)
        setState('scales', ScaleSet(findBounds(action.data)))
        break
    }

    SongStore.emitChange()
  })

})

function setState(key, value) {
  state = state.set(key, value)
}

function loadSongs() {
  reqwest({
    url: 'data/out/songinfo-spotify-echonest-genres.json',
    type: 'json',
    contentType: 'application/json',
    success: (data) => { LoadActions.dataLoaded(data) }
  })
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
  ,   genres = {}

  dataset.forEach((songData) => {
    songData.versions.forEach((versionData) => {
      if (versionData.echonest) {
        adjustBounds(energy, versionData.echonest.energy);
      }
    })
  })

  return {
    energyRange: energy,
    genres: Object.keys(genres)
  }
}

function ScaleSet(bounds) {
  var orbitRadius = d3.time.scale().domain([new Date(1940, 1, 1), new Date()]).range([50, 200])
  ,   radius = d3.scale.linear().domain([0, 100]).range([3, 18])
  ,   color = d3.scale.ordinal().domain(bounds.genres).range(['#E5D166', '#9BC054', '#57BF93', '#5882B4', '#CD6586'])
//  ,   rotation = d3.scale.linear().domain([0, 1]).range([270, 450])
  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, 360])
  ,   speed = d3.scale.linear().domain(bounds.energyRange).range([0.5, 2.5])

  return {
    getOrbitRadiusScale: () => orbitRadius,
    getRadiusScale: () => radius,
    getColorScale: () => color,
    getRotationScale: () => rotation,
    getSpeedScale: () => speed
  }
}

module.exports = SongStore
