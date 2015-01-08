'use strict';

var state = {
  hoveredSystemId: null
}

var DynamicStateStore = {

  getState() {
    return state
  },

  setHoveredSystem(id) {
    state.hoveredSystemId = id
  }

}

module.exports = DynamicStateStore
