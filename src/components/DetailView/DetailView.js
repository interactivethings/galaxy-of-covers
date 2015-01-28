'use strict';

var d3 = require('d3')
,   Vec2 = require('svec2')

require('components/DetailView/DetailView.scss')

var DataUtil = require('util/datautil')
,   SvgUtil = require('util/svgutil')

var DetailView = {

  applyDetailLayout(datum, state) {
    var highlineY = 60
    ,   baselineY = window.innerHeight * 4 / 5
    ,   timelineTop = highlineY + (baselineY - highlineY) * 1 / 5
    ,   energyRange = DataUtil.getMinMax(datum.versionsFilteredIn, (item) => item.energy || 0)
    ,   timelineYScale = d3.scale.linear().domain(energyRange).range([baselineY, timelineTop])
    ,   timeRange = DataUtil.getMinMax(datum.versionsFilteredIn, (item) => item.parsedDate)
    ,   timelineXRange = [100, window.innerWidth - 100]
    ,   timelineXScale = d3.time.scale().domain(timeRange).range(timelineXRange)

    datum.versionsFilteredIn.forEach((versionData) => {
      versionData.timelineCX = timelineXScale(versionData.parsedDate)
      versionData.timelineCY = timelineYScale(versionData.energy)
      versionData.timelineBaseY = baselineY
      if (versionData.isCircle) {
        versionData.tailpt1 = [-versionData.timelinePlanetRadius, 0]
        versionData.tailpt2 = [versionData.timelinePlanetRadius, 0]
      } else {
        var a = Math.floor(versionData.numSides / 2) * 2 * Math.PI / versionData.numSides
        ,   pt1 = new Vec2(-1, 0)
        ,   pt2 = new Vec2(Math.cos(a), Math.sin(a))
        ,   diagonal = Vec2.diff(pt2, pt1)
        ,   rot = Vec2.crossProduct(new Vec2(1, 0), diagonal)
        ,   polyPoints = SvgUtil.getOffsetPolygonPointsArray(0, 0, versionData.timelinePlanetRadius, versionData.numSides, rot / 2)

        versionData.polygonPoints = polyPoints
        versionData.tailpt1 = polyPoints[0]
        versionData.tailpt2 = polyPoints[Math.ceil(polyPoints.length / 2)]
      }
    })

    return {
      baselineY: baselineY
    , timelineXScale: timelineXScale
    }
  },

  render(node, data, state, dimensions) {
    var d3Node = d3.select(node)

    var systems = d3Node.selectAll('.SongSystem')

    systems.filter((d) => d.songId !== data.songId)
      .transition()
      .style('opacity', 0)
      .remove()

    var includedSystems = systems.filter((d) => d.songId === data.songId)

    includedSystems.selectAll('.SongSystem--background, .SongSystem--glowingstar, .SongSystem--orbit, .SongSystem--songtitle')
      .transition()
      .style('opacity', 0)
      .remove()

    var planets = includedSystems.selectAll('.SongSystem--planet')

    planets
      .transition()
      .duration(1000)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineBaseY))
      .transition()
      .duration(1500)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineCY))

    var star = d3Node.selectAll('.SongDetailStar')
      .data([0])

    star.enter().append('circle')
      .attr('class', 'SongDetailStar')

    star.exit().remove()

    star
      .attr('cx', 0)
      .attr('cy', dimensions.baselineY)
      .attr('r', 8)

    var axisDomain = dimensions.timelineXScale.domain()
    ,   axisRange = dimensions.timelineXScale.range()

    var axis = d3Node.selectAll('.SongTimelineAxis')
      .data([0])

    axis.enter().append('g')
      .attr('class', 'SongTimelineAxis')

    axis.exit().remove()

    axis
      .attr('transform', SvgUtil.translateString(0, dimensions.baselineY))

    var axisLine = axis.selectAll('.SongTimelineAxis--line')
      .data([0])

    axisLine.enter().append('line')
      .attr('class', 'SongTimelineAxis--line')

    axisLine.exit().remove()

    axisLine
      .attr('x1', axisRange[0])
      .attr('x2', axisRange[1])

    var axisLabels = axis.selectAll('.SongTimelineAxis--label')
      .data(axisDomain)

    axisLabels.enter().append('text')
      .attr('class',' SongTimelineAxis--label')

    axisLabels.exit().remove()

    axisLabels
      .attr('x', (d, i) => axisRange[i])
      .attr('y', 10)
      .text((d) => d.getFullYear())

    var axisTicks = axis.selectAll('SongTimelineAxis--line__axistick')
      .data(data.versionsFilteredIn.map((d) => dimensions.timelineXScale(d.parsedDate) ))

    axisTicks.enter().append('line')
      .attr('class', 'SongTimelineAxis--line__axistick')

    axisTicks.exit().remove()

    axisTicks
      .attr('x1', (d) => d)
      .attr('y1', -5)
      .attr('x2', (d) => d)
      .attr('y2', 5)
  }

}

module.exports = DetailView
