'use strict';

var SongStore = require('stores/SongStore')

// source: https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
var supportPageOffset = window.pageXOffset !== undefined
var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat")

var Layout = {

  getWindowDimensions() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  },

  getScrollY() {
    return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop
  },

  getLayout() {
    var dynamicState = SongStore.getDynamic()
    ,   dim = this.getWindowDimensions()
    ,   componentLayout

    if (dynamicState.get('inDetail')) {
      componentLayout =
      { headerHeight: 60
      , headerWidth: dim.width
      , legendHeight: 175
      , bodyHeight: dim.height
      , bodyWidth: dim.width
      , timelineTop: dynamicState.get('legendOpen') ? 60 + 175 : 60
      , timelineBase: dim.height * 4 / 5
      , timelineLeftRightPadding: 100
      }
    } else {
      componentLayout =
      { headerHeight: 60
      , headerWidth: dim.width
      , legendHeight: 175
      , bodyWidth: dim.width
      }
    }

    return componentLayout
  }

}

module.exports = Layout
