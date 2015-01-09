var TweenMax = require('TweenMax')

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
  },

  clickOnSongSystem(id) {
    Dispatcher.handleViewAction({
      type: 'CLICK_SYSTEM',
      systemId: id
    })

    // this should be called after a transition
    Dispatcher.handleViewAction({
      type: 'SHOW_DETAIL',
      systemId: id
    })
  },

  navToGalaxy() {
    Dispatcher.handleViewAction({
      type: 'SHOW_GALAXY'
    })
  }

}

module.exports = ViewActions
