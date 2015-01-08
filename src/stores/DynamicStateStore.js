'use strict';

var Immutable = require('Immutable')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map({
  hoveredSystemId: null,
  detailTransitionId: null,
  detailSystemId: null,
  inTransition: false,
  inDetail: false
})

var DynamicStateStore = {

  getState() {
    return state
  },

  handleAction(action) {
    switch (action.type) {
      case 'HOVER_SYSTEM':
        if (!state.get('inTransition')) {
          this.setHoveredSystem(action.systemId)
        }
        break
      case 'HOVER_OFF_SYSTEM':
        this.setHoveredSystem(null)
        break
      case 'CLICK_SYSTEM':
        if (!state.get('inTransition')) {
          this.transitionToDetail(action.systemId)
        }
        break
      case 'END_TRANSITION':
        this.endTransition()
        break
      case 'SHOW_DETAIL':
        this.showDetail(action.systemId)
        break
      case 'SHOW_GALAXY':
        this.showGalaxy()
        break
    }
  },

  setHoveredSystem(id) {
    setState('hoveredSystemId', id)
  },

  transitionToDetail(id) {
    setStateObj({
      inTransition: true,
      detailTransitionId: id
    })
  },

  endTransition() {
    setState('inTransition', false)
  },

  showDetail(id) {
    setStateObj({
      inTransition: false,
      detailSystemId: id,
      inDetail: true
    })
  },

  showGalaxy() {
    setStateObj({
      hoveredSystemId: null,
      inTransition: false,
      detailTransitionId: null,
      detailSystemId: null,
      inDetail: false
    })
  }

}

module.exports = DynamicStateStore
