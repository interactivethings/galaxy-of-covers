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

    if (state.get('inDetail')) {
      lyt =
      { headerHeight: 60
      , headerWidth: width
      , legendHeight: 175
      , bodyHeight: height
      , bodyWidth: width
      , tlHighline: state.get('legendOpen') ? 60 + 200 : 60
      , tlBase: height * (height > 1000 ? 4 / 5 : height > 500 ? 15 / 16 : 19 / 20)
      , tlLRPad: 100
      }
      lyt.tlHeader = lyt.tlHighline + height * (height > 1000 ? 1 / 9 : 1 / 30)
      lyt.tlTop = lyt.tlHighline + (lyt.tlBase - lyt.tlHighline) * (height > 1000 ? 1 / 5 : height > 500 ? 1 / 6 : 1 / 8)
    } else {
      lyt =
      { headerHeight: 60
      , headerWidth: width
      , legendHeight: 175
      , bodyWidth: width
      }
    }

    return lyt
  }

}

module.exports = Layout
