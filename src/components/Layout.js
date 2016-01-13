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
    var state = SongStore.getState()
    ,   {width, height} = this.getWindowDimensions()
    ,   lyt
    ,   closedLegendHeight = 58 + 20
    ,   openLegendHeight = 180

    if (state.get('inDetail')) {
      lyt =
      { headerHeight: closedLegendHeight
      , headerWidth: width
      , bodyHeight: height
      , bodyWidth: width
      , tlHighline: state.get('legendOpen') ? closedLegendHeight + openLegendHeight : closedLegendHeight
      , tlBase: height * (height > 1000 ? 7 / 8 : height > 500 ? 15 / 16 : 19 / 20)
      , tlLRPad: 100
      }
      lyt.tlHeader = lyt.tlHighline + height * (height > 1000 ? 1 / 12 : 1 / 16)
      lyt.tlTop = lyt.tlHighline + (lyt.tlBase - lyt.tlHighline) * (height > 1000 ? 1 / 5 : height > 500 ? 1 / 6 : 1 / 8)
    } else {
      lyt =
      { headerHeight: closedLegendHeight
      , headerWidth: width
      , bodyWidth: width
      }
    }

    return lyt
  }

}

module.exports = Layout
