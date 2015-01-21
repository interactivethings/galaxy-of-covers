'use strict';

var Immutable = require('Immutable')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map()

// properties should all be mutable objects
setStateObj({
  hoveredSystemId: null,
  detailTransitionId: null,
  detailSystemId: null,
  inTransition: false,
  inDetail: false,
  shareOpen: false,
  legendOpen: false,
  aboutOpen: false,
  highlightedAttribute: null,
  filteredGenres: Immutable.Map()
})

var DynamicStateStore = {

  getState() {
    return state
  },

  isInDetail() {
    return state.get('inDetail')
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
        this.navMenuToggle('shareOpen', true)
        break
      case 'CLOSE_SHARE':
        this.navMenuToggle('shareOpen', false)
        break
      case 'LEGEND_SHOW':
        this.navMenuToggle('legendOpen', true)
        break
      case 'LEGEND_HIDE':
        this.navMenuToggle('legendOpen', false)
        break
      case 'ABOUT_HIDE':
        this.navMenuToggle('aboutOpen', false)
        break
      case 'ABOUT_SHOW':
        this.navMenuToggle('aboutOpen', true)
        break
      case 'ATTRIBUTE_HIGHLIGHT':
        if (state.get('highlightedAttribute') === action.attributeToHighlight) {
          setState('highlightedAttribute', null)
        } else {
          setState('highlightedAttribute', action.attributeToHighlight)
        }
      case 'FILTER_GENRE':
        this.toggleFilteredGenre(action.genre)
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
  },

  navMenuToggle(optionName, isOpen) {
    // toggling any of the three automatically closes the other two
    var optionProps = {
      shareOpen: false,
      legendOpen: false,
      aboutOpen: false
    }
    optionProps[optionName] = isOpen
    setStateObj(optionProps)
  },

  toggleFilteredGenre(genre) {
    var filter = state.get('filteredGenres')
    if (filter.get(genre)) filter = filter.set(genre, false)
    else filter = filter.set(genre, true)
    setState('filteredGenres', filter)
  }

}

module.exports = DynamicStateStore
