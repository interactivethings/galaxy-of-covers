var TweenMax = require('TweenMax')

var Dispatcher = require('dispatcher/AppDispatcher')

var ViewActions = {

  hoverOnSongSystem(id) {
    Dispatcher.handleViewAction({
      type: 'HOVER_SYSTEM',
      systemId: id
    })
  },

  hoverOffSongSystem() {
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
  },

  openShare() {
    Dispatcher.handleViewAction({
      type: 'OPEN_SHARE'
    })
  },

  closeShare() {
    Dispatcher.handleViewAction({
      type: 'CLOSE_SHARE'
    })
  },

  showLegend() {
    Dispatcher.handleViewAction({
      type: 'LEGEND_SHOW'
    })
  },

  hideLegend() {
    Dispatcher.handleViewAction({
      type: 'LEGEND_HIDE'
    })
  },

  hideAbout() {
    Dispatcher.handleViewAction({
      type: 'ABOUT_HIDE'
    })
  },

  showAbout() {
    Dispatcher.handleViewAction({
      type: 'ABOUT_SHOW'
    })
  },

  highlightAttribute(attributeName) {
    Dispatcher.handleViewAction({
      type: 'ATTRIBUTE_HIGHLIGHT',
      attributeToHighlight: attributeName
    })
  }

}

module.exports = ViewActions
