'use strict';

require('components/GalaxyView/GalaxyView.scss')

var Constants = require('Constants')
,   SvgUtil = require('util/svgutil')
,   ViewActions = require('actions/ViewActions')

var ROOT_THREE = Math.sqrt(3)

var cos = Math.cos
var sin = Math.sin

function planetPosition(planet, t) {
  var ang = t * planet.orbitSpeed
  ,   px = cos(ang) * planet.orbitRadiusX
  ,   py = sin(ang) * planet.orbitRadiusY
  ,   rc = planet.orbitRotationOffsetCos
  ,   rs = planet.orbitRotationOffsetSin
  ,   pos = [planet.galaxyX + rc * px - rs * py, planet.galaxyY + rs * px + rc * py]
  return 'translate(' + pos.join(',') + ')'
}

function planetOpacity(blinkSpeed, t) {
  return (sin(t * blinkSpeed) + 1.8) / 2
}

function startContinuousAnimation(datum) {
  var node = this
  datum.stopAnimation = false

  d3.timer(function(time) {
    node.setAttribute('transform', planetPosition(datum, time))
    node.setAttribute('opacity', planetOpacity(datum.blinkSpeed, time))

    return datum.stopAnimation
  })
}

function stopContinuousAnimation(datum) {
  datum.stopAnimation = true
}

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
    ,   systemRadius = Constants.SYSTEM_WIDTH
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

  render(node, data, state) {
    var d3Node = d3.select(node)

    var systems = d3Node.selectAll('.SongSystem')
      .data(data)

    var enterSystems = systems.enter()
      .append('g')
      .attr('class', 'SongSystem')
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
    enterSystems
      .append('use')
      .attr('class', 'SongSystem--background')
      .attr('transform', (d) => SvgUtil.getTranslateAndRotate(d.galaxyX, d.galaxyY, -20))

    systems.selectAll('.SongSystem--background')
      .attr('xlink:href', (d) => d.systemIsHovered ? '#galaxyShadedBackgroudCircle' : '#galaxyNoBackgroudCircle')

    enterSystems
      .append('circle')
      .attr('class', 'SongSystem--glowingstar')
      .attr('r', 5)
      .attr('transform', (d) => SvgUtil.translateString(d.galaxyX, d.galaxyY))

    var orbits = systems.selectAll('.SongSystem--orbit')
      .data((d) => d.versionsFilteredIn)

    orbits.enter()
      .append('ellipse')
      .attr('class', 'SongSystem--orbit')
      .attr('rx', (d) => d.orbitRadiusX)
      .attr('ry', (d) => d.orbitRadiusY)
      .attr('transform', (d) => SvgUtil.getTranslateAndRotate(d.galaxyX, d.galaxyY, d.orbitRotationOffset))

    orbits.exit().remove()

    var roundPlanets = systems.selectAll('.SongSystem--planet.SongSystem--planet__round')
      .data((d) => d.versionsFilteredIn.filter((v) => v.isCircle))

    roundPlanets.enter()
      .append('circle')
      .attr('class', 'SongSystem--planet SongSystem--planet__round')
      .attr('r', (d) => d.galaxyPlanetRadius)
      .attr('fill', (d) => d.genreColor)
      .attr('transform', (d) => planetPosition(d, 0))
      .each(startContinuousAnimation)

    roundPlanets.exit().each(stopContinuousAnimation).remove()

    var pointyPlanets = systems.selectAll('.SongSystem--planet.SongSystem--planet__pointy')
      .data((d) => d.versionsFilteredIn.filter((v) => !v.isCircle))

    pointyPlanets.enter()
      .append('polygon')
      .attr('class', 'SongSystem--planet SongSystem--planet__pointy')
      .attr('points', (d) => SvgUtil.getPolygonPoints(0, 0, d.galaxyPlanetRadius, d.numSides))
      .attr('fill', (d) => d.genreColor)
      .attr('transform', (d) => planetPosition(d, 0))
      .each(startContinuousAnimation)

    pointyPlanets.exit().each(stopContinuousAnimation).remove()

    // song label
    enterSystems
      .append('text')
      .attr('class', 'SongSystem--songtitle')
      .attr('dy', -20)
      .text((d) => d.title)
      .attr('transform', (d) => SvgUtil.translateString(d.galaxyX, d.galaxyY))
  }

}

module.exports = GalaxyView
