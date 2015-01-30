'use strict';

var d3 = require('d3')

require('components/GalaxyView/GalaxyView.scss')

var Constants = require('Constants')
,   SvgUtil = require('util/svgutil')
,   ViewActions = require('actions/ViewActions')
,   AnimationUtil = require('util/AnimationUtil')

var ROOT_THREE = Math.sqrt(3)

var GalaxyView = {

  numRows(numSystems) {
    var n = 2 * Math.ceil(numSystems / 3)
    if (numSystems % 3 !== 0) n--
    return n
  },

  getGalaxyGroupDimensions(systemRadius, numSystems) {
    var width = window.innerWidth
    ,   height = 2 * systemRadius + this.numRows(numSystems) * (width / 4 * Math.tan(Math.PI / 3))
    return {width, height}
  },

  makeHexGrid(length, maxCols) {
    var grid = []
    ,   column = 0
    ,   r = 0
    ,   shortRowBit = 0 // start with a long row
    for (var i = 0; i < length; ++i) {
      grid.push({
        q: column - ((r / 2) | 0) // (x | 0) is a simple Math.floor
      , r: r
      })

      column++
      if (!shortRowBit) {
        if (column == maxCols) {
          column = 0
          r++
          shortRowBit = 1
        }
      } else {
        if (column == maxCols - 1) {
          column = 0
          r++
          shortRowBit = 0
        }
      }
    }
    return grid
  },

  gridToLayout(grid) {
    return grid.map((hex) => {
      return {
        dx: ROOT_THREE * (hex.q + hex.r / 2)
      , dy: 3 / 2 * hex.r
      }
    })
  },

  applyHexLayout(data) {
    if (!data.length) return {}

    var width = window.innerWidth
    ,   systemRadius = Constants.SYSTEM_RADIUS
    ,   hexRadius = ((systemRadius / ROOT_THREE) * 2) + Constants.SYSTEM_PADDING
    ,   hexWidth = hexRadius / 2 * ROOT_THREE * 2
    ,   numSystemsWidest = Math.floor(width / hexWidth)
    ,   hexLayout = this.gridToLayout(this.makeHexGrid(data.length, numSystemsWidest))
    ,   leftOffset = ((((width / hexWidth) % 1) / 2) * hexWidth) + (hexWidth / 2)
    ,   topOffset = hexRadius
    data.forEach(function(songData, i) {
      var hex = hexLayout[i]
      ,   sx = leftOffset + hexRadius * hex.dx
      ,   sy = topOffset + hexRadius * hex.dy

      songData.galaxyX = sx
      songData.galaxyY = sy
      songData.versions.forEach((v) => {
        v.galaxyX = sx
        v.galaxyY = sy
      })
    })

    return {
      layoutWidth: width
    , layoutHeight: topOffset + hexRadius * hexLayout[hexLayout.length - 1].dy + hexRadius
    }
  },

  isActive(node) {
    return d3.select(node).classed('MainView__galaxy')
  },

  render(node, data, state, dimensions) {
    var d3Node = d3.select(node)

    d3Node
      .classed('MainView__galaxy', true)
      .attr('width', dimensions.layoutWidth)
      .attr('height', dimensions.layoutHeight)

    d3Node.datum(dimensions)

    data = data.filter((d) => d.isInViewport)

    var viewWrapper = d3Node.selectAll('.ViewWrapper')

    if (viewWrapper.empty()) {
      viewWrapper = d3Node.append('g')
        .attr('class', 'ViewWrapper')
    }

    viewWrapper.attr('transform', 'translate(0,0)')

    var systems = viewWrapper.selectAll('.SongSystem')
      .data(data, (d) => d.songId)

    var enterSystems = systems.enter()
      .append('g')
      .attr('class', 'SongSystem')
      .attr('opacity', 0)
      .transition()
      .attr('opacity', 1)

    systems.exit()
      .transition()
      .attr('opacity', 0)
      .remove()

    systems
      .on('mouseenter', (d) => {
        ViewActions.hoverOnSongSystem(d.songId)
      })
      .on('mouseleave', (d) => {
        ViewActions.hoverOffSongSystem()
      })
      .on('click', (d) => {
        ViewActions.clickOnSongSystem(d.songId)
      })

    // background and star
    var backgrounds = systems.selectAll('.SongSystem--background')
      .data((d) => [d])

    backgrounds.enter()
      .append('use')
      .attr('class', 'SongSystem--background')

    backgrounds
      .attr('transform', (d) => SvgUtil.getTranslateAndRotate(d.galaxyX, d.galaxyY, -20))
      .attr('xlink:href', (d) => d.systemIsHovered ? '#galaxyShadedBackgroudCircle' : '#galaxyNoBackgroudCircle')

    backgrounds.exit().remove()

    var stars = systems.selectAll('.SongSystem--glowingstar')
      .data((d) => [d])

    stars.enter()
      .append('circle')
      .attr('class', 'SongSystem--glowingstar')
      .attr('r', 5)

    stars
      .attr('transform', (d) => SvgUtil.translateString(d.galaxyX, d.galaxyY))

    var orbits = systems.selectAll('.SongSystem--orbit')
      .data((d) => d.versionsFilteredIn, (d) => d.versionId)

    orbits.enter()
      .append('ellipse')
      .attr('class', 'SongSystem--orbit')

    orbits.exit().remove()

    orbits
      .attr('rx', (d) => d.orbitRadiusX)
      .attr('ry', (d) => d.orbitRadiusY)
      .attr('transform', (d) => SvgUtil.getTranslateAndRotate(d.galaxyX, d.galaxyY, d.orbitRotationOffset))

    var roundPlanets = systems.selectAll('.SongSystem--planet.SongSystem--planet__round')
      .data((d) => d.versionsFilteredIn.filter((datum) => datum.isCircle), (d) => d.versionId)

    roundPlanets.exit()
      .remove()

    roundPlanets.enter()
      .append('circle')
      .attr('class', 'SongSystem--planet SongSystem--planet__round')

    roundPlanets
      .attr('r', (d) => d.galaxyPlanetRadius)
      .attr('fill', (d) => d.genreColor)

    var pointyPlanets = systems.selectAll('.SongSystem--planet.SongSystem--planet__pointy')
      .data((d) => d.versionsFilteredIn.filter((datum) => !datum.isCircle), (d) => d.versionId)

    pointyPlanets.exit()
      .remove()

    pointyPlanets.enter()
      .append('polygon')
      .attr('class', 'SongSystem--planet SongSystem--planet__pointy')

    pointyPlanets
      .attr('points', (d) => SvgUtil.getPolygonPoints(0, 0, d.galaxyPlanetRadius, d.numSides))
      .attr('fill', (d) => d.genreColor)

    // song label is above the rest of the system
    var labels = systems.selectAll('.SongSystem--songtitle')
      .data((d) => [d])

    labels.enter()
      .append('text')
      .attr('class', 'SongSystem--songtitle')
      .attr('dy', -20)

    labels
      .text((d) => d.title)
      .attr('transform', (d) => SvgUtil.translateString(d.galaxyX, d.galaxyY))
  }

}

module.exports = GalaxyView
