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

  getLayout(windowSize) {
    var state = SongStore.getState()
    ,   {width, height} = this.getWindowDimensions()
    ,   lyt = {}
    // Breakpoint defined here
    ,   narrowScreen = windowSize[0] < 850
    ,   titleHeight = 58
    ,   menuHeight = narrowScreen ? (state.get('aboutShareOpen') ? 205 : 128) : titleHeight
    ,   legendBarHeight = 20
    ,   closedLegendHeight = menuHeight + legendBarHeight
    ,   openLegendHeight = 180

    if (state.get('inDetail')) {
      lyt =
      { headerHeight: closedLegendHeight
      , titleHeight: menuHeight
      , legendBarHeight: legendBarHeight
      , headerWidth: width
      , bodyHeight: height
      , bodyWidth: width
      , tlHighline: state.get('legendOpen') ? (closedLegendHeight + openLegendHeight) : closedLegendHeight
      , tlBase: height * (height > 1000 ? 7 / 8 : height > 500 ? 15 / 16 : 19 / 20)
      , tlSidePad: 100
      , stackedHeader: narrowScreen
      }
      lyt.tlHeader = lyt.tlHighline + height * (height > 1000 ? 1 / 12 : 1 / 16)
      lyt.tlTop = lyt.tlHighline + (lyt.tlBase - lyt.tlHighline) * (height > 1000 ? 1 / 5 : height > 500 ? 1 / 6 : 1 / 8)
    } else {
      lyt =
      { headerHeight: closedLegendHeight
      , titleHeight: menuHeight
      , legendBarHeight: legendBarHeight
      , headerWidth: width
      , bodyWidth: width
      , stackedHeader: narrowScreen
      }
    }

    return lyt
  }

}

module.exports = Layout
