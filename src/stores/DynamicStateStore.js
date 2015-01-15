'use strict';

var Immutable = require('Immutable')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map({
  hoveredSystemId: null,
  detailTransitionId: null,
  detailSystemId: null,
  inTransition: false,
  inDetail: false,
  shareOpen: false,
  legendVisible: false
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
        setState('inTransition', false)
        break
      case 'SHOW_DETAIL':
        this.showDetail(action.systemId)
        break
      case 'SHOW_GALAXY':
        this.showGalaxy()
        break
      case 'OPEN_SHARE':
        setState('shareOpen', true)
        break
      case 'CLOSE_SHARE':
        setState('shareOpen', false)
        break
      case 'LEGEND_SHOW':
        setState('legendVisible', true)
        break
      case 'LEGEND_HIDE':
        setState('legendVisible', false)
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
