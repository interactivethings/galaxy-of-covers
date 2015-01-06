var LoadActions = require('actions/LoadActions')
,   AppDispatcher = require('dispatcher/AppDispatcher')
,   reqwest = require('reqwest')
,   {EventEmitter} = require('events')
,   _ = require('lodash')
,   Immutable = require('Immutable')

var state = Immutable.fromJS({
  songs: null
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

  dispatcherToken: AppDispatcher.register((payload) => {
    var {action} = payload;

    switch (action.type) {
      case 'LOAD_SONG_DATA':
        loadSongs()
        break
      case 'SONGS_LOADED':
        setState('songs', action.data)
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

module.exports = SongStore
