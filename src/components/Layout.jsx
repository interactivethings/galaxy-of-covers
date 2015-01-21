'use strict';

var SongStore = require('stores/SongStore')

var Layout = {

  getWindowDimensions() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  },

  getLayout(dynamicState) {
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
      }
    } else {
      componentLayout =
      { headerHeight: 60
      , headerWidth: dim.width
      , legendHeight: 175
      , bodyHeight: dim.height
      , bodyWidth: dim.width
      }
    }

    return componentLayout
  }

}

module.exports = Layout
