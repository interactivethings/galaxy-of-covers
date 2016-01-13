var Dispatcher = require('dispatcher/AppDispatcher')

var LoadActions = {
  initialLoad() {
    Dispatcher.handleDataAction({
      type: 'LOAD_SONG_DATA'
    })
  },

  dataLoaded(data) {
    Dispatcher.handleDataAction({
      type: 'SONGS_LOADED',
      data: data
    })
  }
}

module.exports = LoadActions
