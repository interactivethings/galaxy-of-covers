'use strict';

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
      type: 'SHOW_DETAIL',
      systemId: id
    })
  },

  navToGalaxy() {
    Dispatcher.handleViewAction({
      type: 'SHOW_GALAXY'
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
  },

  registerGenreClick(genreName) {
    Dispatcher.handleViewAction({
      type: 'FILTER_GENRE',
      genre: genreName
    })
  },

  hoverOnDetailVersion(data) {
    Dispatcher.handleViewAction({
      type: 'HOVER_VERSION',
      versionData: data
    })
  },

  hoverOffDetailVersion() {
    Dispatcher.handleViewAction({
      type: 'HOVER_OFF_VERSION'
    })
  }

}

module.exports = ViewActions
