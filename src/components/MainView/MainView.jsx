'use strict';

var React = require('react')

var ViewFilters = require('util/ViewFilters')
,   GalaxyView = require('components/GalaxyView/GalaxyView')
,   DetailView = require('components/DetailView/DetailView')
,   Constants = require('Constants')

var MainView = React.createClass({

  componentDidMount() {
    var node = this.getDOMNode()
    ViewFilters.renderFilters(node)
  },

  componentDidUpdate() {
    var data = this.props.displayObjects
    ,   state = this.props.dynamicState
    ,   node = this.getDOMNode()
    ,   genreFilter = state.get('filteredGenres')

    if (state.get('inGalaxy')) {
      var dimensions = GalaxyView.applyHexLayout(data) // this also mutates data
      node.setAttribute('width', dimensions.layoutWidth)
      node.setAttribute('height', dimensions.layoutHeight)

      if (!data.length) return true

      var hoveredId = state.get('hoveredSystemId')
      ,   systemMinY = this.props.scrollY - 2 * Constants.SYSTEM_BACKGROUND_RADIUS
      ,   systemMaxY = this.props.scrollY + window.innerHeight + 2 * Constants.SYSTEM_BACKGROUND_RADIUS

      data.forEach((songData) => {
        songData.versionsFilteredIn = songData.versions.filter((versionData) => !genreFilter.get(versionData.genreName))
        songData.isInViewport = systemMinY <= songData.galaxyY && songData.galaxyY <= systemMaxY
        var isHovered = songData.songId === hoveredId
        if (isHovered !== songData.systemIsHovered) {
          songData.versions.forEach((v) => {
            v.pauseAnimation = isHovered
          })
          songData.systemIsHovered = isHovered
        }
      })

      GalaxyView.render(node, data, state)
    } else if (state.get('inDetail')) {
      var detailData = state.get('detailSongData')
      DetailView.applyDetailLayout(detailData, state)

      node.setAttribute('width', window.innerWidth)
      node.setAttribute('height', window.innerHeight)

      detailData.versionsFilteredIn = detailData.versions.filter((versionData) => !genreFilter.get(versionData.genreName))

      DetailView.render(node, detailData, state)
    }

  },

  render() {
    return (
      <svg className="MainView" key={"dontreplace"} />
    )
  }

})

module.exports = MainView
