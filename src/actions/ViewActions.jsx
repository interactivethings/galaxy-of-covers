var Dispatcher = require('dispatcher/AppDispatcher')

var ViewActions = {
  hoverOnSongSystem(id) {
    Dispatcher.handleViewAction({
      type: 'HOVER_SYSTEM',
      systemId: id
    })
  },

  hoverOffSongSystem(id) {
    Dispatcher.handleViewAction({
      type: 'HOVER_OFF_SYSTEM'
    })
  }
}

module.exports = ViewActions
