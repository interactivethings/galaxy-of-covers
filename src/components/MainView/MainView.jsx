'use strict';

var React = require('react')

var ViewFilters = require('util/ViewFilters')
,   GalaxyView = require('components/GalaxyView/GalaxyView')
,   DetailView = require('components/DetailView/DetailView')
,   Constants = require('Constants')
,   AnimationUtil = require('util/AnimationUtil')

var MainView = React.createClass({

  componentDidMount() {
    var node = this.getDOMNode()
    ViewFilters.renderFilters(node)

    var d3Node = d3.select(node)
    var prevTime = 0
    d3.timer((time) => {
      if (this.props.dynamicState.get('inDetail')) return

      d3Node.selectAll('.SongSystem--planet')
        .filter((d) => !d.pauseAnimation)
        .each((d) => { d.animationTime += (time - prevTime) })
        .attr('transform', (d) => AnimationUtil.planetPosition(d, d.animationTime))
        .attr('opacity', (d) => AnimationUtil.planetOpacity(d.blinkSpeed, d.animationTime))

      prevTime = time
    })
  },

  componentDidUpdate() {
    var data = this.props.displayObjects
    ,   state = this.props.dynamicState
    ,   node = this.getDOMNode()
    ,   genreFilter = state.get('filteredGenres')

    if (state.get('inGalaxy')) {
      var dimensions = GalaxyView.applyHexLayout(data) // this mutates data using the layout

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

      if (DetailView.isActive(node)) {
        var oldScrollPos = this.props.scrollY
        DetailView.deRender(node, function() {
          GalaxyView.render(node, data, state, dimensions)
          window.scrollTo(0, oldScrollPos)
        })
      } else {
        GalaxyView.render(node, data, state, dimensions)
      }
    } else if (state.get('inDetail')) {
      var detailData = state.get('detailSongData')
      ,   dimensions = DetailView.applyDetailLayout(detailData, state, this.props.scrollY) // this mutates detailData using the layout

      detailData.versionsFilteredIn = detailData.versions.filter((versionData) => !genreFilter.get(versionData.genreName))

      if (GalaxyView.isActive(node)) {
        DetailView.transitionIn(node, detailData, state, dimensions, function() {
          DetailView.render(node, detailData, state, dimensions)
        })
      } else {
        DetailView.render(node, detailData, state, dimensions)
      }
    }

  },

  render() {
    return (
      <svg className="MainView" key={"dontreplace"} />
    )
  }

})

module.exports = MainView
