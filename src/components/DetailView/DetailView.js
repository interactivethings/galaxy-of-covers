'use strict';

var d3 = require('d3')
,   Vec2 = require('svec2')

require('components/DetailView/DetailView.scss')

var DataUtil = require('util/datautil')
,   SvgUtil = require('util/svgutil')

function energyBaselinePoints(d) {
  var x = d.timelineCX
  ,   baseY = d.timelineBaseY
  ,   p1 = d.tailpt1
  ,   p2 = d.tailpt2
  ,   pts = [
    [x, baseY],
    [x + p1[0], baseY + p1[1]],
    [x + p2[0], baseY + p2[1]],
    [x, baseY]
  ]
  return pts.join(' ')
}

function energyExtendedPoints(d) {
  var x = d.timelineCX
  ,   baseY = d.timelineBaseY
  ,   y = d.timelineCY
  ,   p1 = d.tailpt1
  ,   p2 = d.tailpt2
  ,   pts = [
        [x, baseY],
        [x + p1[0], y + p1[1]],
        [x + p2[0], y + p2[1]],
        [x, baseY]
      ]
  return pts.join(' ')
}

function renderDetailShapes(selection) {
  selection
    .attr('clip-path', (d) => 'url(#' + 'tlplanetclip-' + d.versionId + ')')

  var detailClips = selection.selectAll('.SongTimeline--clip')
    .data((d) => [d])

  detailClips.enter().append('clipPath')
    .attr('class', 'SongTimeline--clip')

  detailClips.exit().remove()

  detailClips
    .attr('id', (d) => 'tlplanetclip-' + d.versionId)

  var detailClipUse = detailClips.selectAll('use')
    .data((d) => [d])

  detailClipUse.enter().append('use')

  detailClipUse.exit().remove()

  detailClipUse
    .attr('xlink:href', (d) => '#' + 'tlplanet-' + d.versionId)

  var roundDetailShapes = selection.filter((d) => d.isCircle)
    .selectAll('.SongTimeline--planet__shape.SongTimeline--planet__round')
    .data((d) => [d])

  roundDetailShapes.enter().append('circle')
    .attr('class', 'SongTimeline--planet__shape SongTimeline--planet__round')

  roundDetailShapes
    .attr('id', (d) => 'tlplanet-' + d.versionId)
    .attr('r', (d) => d.timelinePlanetRadius)
    .attr('fill', (d) => d.genreColor)

  roundDetailShapes.exit().remove()

  var pointyDetailShapes = selection.filter((d) => !d.isCircle)
    .selectAll('.SongTimeline--planet__shape.SongTimeline--planet__pointy')
    .data((d) => [d])

  pointyDetailShapes.enter().append('polygon')
    .attr('class', 'SongTimeline--planet__shape SongTimeline--planet__pointy')

  pointyDetailShapes
    .attr('id', (d) => 'tlplanet-' + d.versionId)
    .attr('points', (d) => SvgUtil.joinPolygonPoints(d.polygonPoints))
    .attr('fill', (d) => d.genreColor)

  pointyDetailShapes.exit().remove()

  var detailShadows = selection.selectAll('.SongTimeline--planet__shadow')
    .data((d) => [d])

  detailShadows.enter().append('rect')
    .attr('class', 'SongTimeline--planet__shadow')

  detailShadows.exit().remove()

  detailShadows
    .attr('transform', (d) => 'rotate(' + d.timelineRotation + ')' )
    .attr('y', (d) => -d.timelinePlanetRadius)
    .attr('width', (d) => 2 * d.timelinePlanetRadius)
    .attr('height', (d) => 2 * d.timelinePlanetRadius)
}

function axisStar(selection, yPosition) {
  var star = selection.selectAll('.SongDetailStar')
    .data([0])

  star.enter().append('circle')
    .attr('class', 'SongDetailStar')
    .attr('opacity', 0)

  star.exit().remove()

  star
    .attr('cx', 0)
    .attr('cy', yPosition)
    .attr('r', 8)
    .transition()
    .attr('opacity', 1)
}

function axis(selection, yPosition, xDomain, xRange, ticks) {
  var axis = selection.selectAll('.SongTimelineAxis')

  if (axis.empty()) {
    axis = selection.append('g')
      .attr('class', 'SongTimelineAxis')
      .attr('opacity', 0)
  }

  axis
    .attr('transform', SvgUtil.translateString(0, yPosition))
    .transition()
    .attr('opacity', 1)

  var axisLine = axis.selectAll('.SongTimelineAxis--line')

  if (axisLine.empty()) {
    axisLine = axis.append('line')
      .attr('class', 'SongTimelineAxis--line')
  }

  axisLine
    .attr('x1', xRange[0])
    .attr('x2', xRange[1])

  var axisLabels = axis.selectAll('.SongTimelineAxis--label')
    .data(xDomain)

  axisLabels.enter().append('text')
    .attr('class',' SongTimelineAxis--label')

  axisLabels.exit().remove()

  axisLabels
    .attr('x', (d, i) => xRange[i])
    .attr('y', 10)
    .text((d) => d.getFullYear())

  var axisTicks = axis.selectAll('SongTimelineAxis--line__axistick')
    .data(ticks)

  axisTicks.enter().append('line')
    .attr('class', 'SongTimelineAxis--line__axistick')

  axisTicks.exit().remove()

  axisTicks
    .attr('x1', (d) => d)
    .attr('y1', -5)
    .attr('x2', (d) => d)
    .attr('y2', 5)
}

var DetailView = {

  applyDetailLayout(datum, state, yOffset) {
    var highlineY = yOffset + (state.get('legendOpen') ? 60 + 175 : 60)
    ,   baselineY = yOffset + window.innerHeight * 4 / 5
    ,   timelineTop = highlineY + (baselineY - highlineY) * 1 / 5
    ,   energyRange = DataUtil.getMinMax(datum.versions, (item) => item.energy || 0)
    ,   timelineYScale = d3.scale.linear().domain(energyRange).range([baselineY, timelineTop])
    ,   timeRange = DataUtil.getMinMax(datum.versions, (item) => item.parsedDate)
    ,   timelineXRange = [100, window.innerWidth - 100]
    ,   timelineXScale = d3.time.scale().domain(timeRange).range(timelineXRange)

    datum.versions.forEach((versionData) => {
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
      yOffset: yOffset
    , baselineY: baselineY
    , timelineXScale: timelineXScale
    , layoutWidth: innerWidth
    , layoutHeight: innerHeight
    }
  },

  isActive(node) {
    return d3.select(node).classed('MainView__detail')
  },

  transitionIn(node, data, state, dimensions, callback) {
    var d3Node = d3.select(node)

    d3Node.classed('MainView__galaxy', false)

    var systems = d3Node.selectAll('.SongSystem')

    systems
      .on('mouseenter', null)
      .on('mouseleave', null)
      .on('click', null)

    systems.filter((d) => d.songId !== data.songId)
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove()

    var includedSystems = systems.filter((d) => d.songId === data.songId)

    includedSystems.selectAll('.SongSystem--background, .SongSystem--glowingstar, .SongSystem--orbit, .SongSystem--songtitle')
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove()

    // existing planets
    var it0 = includedSystems.selectAll('.SongSystem--planet')
      .transition()
      .delay(300)
      .duration(800)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineBaseY))

    var it1 = it0.transition()
      .duration(200)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineBaseY) + ' scale(0)')
      .each('end', DataUtil.before(2, function() {
        callback()
      }))
      .remove()
  },

  render(node, data, state, dimensions) {
    var d3Node = d3.select(node)

    d3Node
      .classed('MainView__detail', true)
      .attr('width', dimensions.layoutWidth)
      .attr('height', dimensions.layoutHeight)

    d3Node.datum(dimensions)

    var viewWrapper = d3Node.selectAll('.ViewWrapper')

    if (viewWrapper.empty()) {
      viewWrapper = d3Node.append('g')
        .attr('class', 'ViewWrapper')
    }

    viewWrapper
      .attr('transform', 'translate(0,' + -dimensions.yOffset + ')')

    var energyTailContainer = viewWrapper.selectAll('.SongTimeline--energytailbox')

    if (energyTailContainer.empty()) {
      energyTailContainer = viewWrapper.append('g')
        .attr('class', 'SongTimeline--energytailbox')
    }

    var detailEnergyTails = energyTailContainer.selectAll('.SongTimeline--energytail')
      .data(data.versionsFilteredIn, (d) => d.versionId)

    detailEnergyTails.exit().remove()

    detailEnergyTails.transition()
      .duration(200)
      .attr('points', energyExtendedPoints)

    detailEnergyTails.enter().append('polygon')
      .attr('class', 'SongTimeline--energytail')
      .attr('points', energyBaselinePoints)
      .transition()
      .delay(200)
      .duration(800)
      .attr('points', energyExtendedPoints)

    // new planets
    var detailPlanets = viewWrapper.selectAll('.SongTimeline--planet')
      .data(data.versionsFilteredIn)

    detailPlanets.transition()
      .duration(200)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineCY))

    detailPlanets.enter().append('g')
      .attr('class', 'SongTimeline--planet')
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineBaseY) + ' scale(0)')
      .transition()
      .duration(200)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineBaseY) + ' scale(1)')
      .transition()
      .duration(800)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineCY))

    detailPlanets.exit().remove()

    // render the shapes
    detailPlanets.call(renderDetailShapes)

    // star
    viewWrapper.call(axisStar, dimensions.baselineY)

    // axis
    viewWrapper.call(axis, dimensions.baselineY, dimensions.timelineXScale.domain(), dimensions.timelineXScale.range(), data.versionsFilteredIn.map((d) => dimensions.timelineXScale(d.parsedDate)))
  },

  deRender(node, callback) {
    var d3Node = d3.select(node)

    var dimensions = d3Node.datum()

    d3Node.classed('MainView__detail', false)

    // cancel any incoming transition, if applicable
    d3Node.selectAll('.SongSystem--planet').interrupt().transition()

    d3Node.selectAll('.SongDetailStar, .SongTimelineAxis')
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove()

    var trailT0 = d3Node.selectAll('.SongTimeline--energytail')
      .transition()
      .duration(500)
      .attr('points', energyBaselinePoints)
      .remove()

    var t0 = d3Node.selectAll('.SongTimeline--planet')
      .transition()
      .duration(500)
      .attr('transform', (d) => SvgUtil.translateString(d.timelineCX, d.timelineBaseY))

    t0.transition()
      .duration(200)
      .attr('opacity', 0)
      .remove()
      .each('end', DataUtil.before(2, function() {
        callback()
      }))
  }

}

module.exports = DetailView
