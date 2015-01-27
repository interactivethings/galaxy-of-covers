'use strict';

var React = require('react')

var ViewFilters = require('util/ViewFilters')
,   GalaxyView = require('components/GalaxyView/GalaxyView')
,   DetailView = require('components/DetailView/DetailView')

var MainView = React.createClass({

  componentDidMount() {
    var node = this.getDOMNode()
    ViewFilters.renderFilters(node)
  },

  componentDidUpdate() {
    var data = this.props.displayObjects
    ,   state = this.props.dynamicState
    ,   node = this.getDOMNode()

    if (state.get('inGalaxy')) {
      var dimensions = GalaxyView.applyHexLayout(data)
      node.setAttribute('width', dimensions.layoutWidth)
      node.setAttribute('height', dimensions.layoutHeight)

      if (!data.length) return true

      var genreFilter = state.get('filteredGenres')
      ,   hoveredId = state.get('hoveredSystemId')
      data.forEach((songData) => {
        songData.versionsFilteredIn = songData.versions.filter((versionData) => !genreFilter.get(versionData.genreName))
        var isHovered = songData.songId === hoveredId
        if (isHovered !== songData.systemIsHovered) {
          songData.versions.forEach((v) => { v.pauseAnimation = isHovered })
          songData.systemIsHovered = isHovered
        }
      })

      GalaxyView.render(node, data, state)
    } else if (state.get('inDetail')) {
      var detailData = state.get('detailSongData')
      node.setAttribute('width', window.innerWidth)
      node.setAttribute('height', window.innerHeight)

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
