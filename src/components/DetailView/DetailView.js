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
  },

  render(node, data, state) {
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
      .attr('transform', (d) => 'translate(' + d.timelineCX + ',' + d.timelineBaseY + ')')
      .transition()
      .duration(1500)
      .attr('transform', (d) => 'translate(' + d.timelineCX + ',' + d.timelineCY + ')')

    return true
  }

}

module.exports = DetailView
