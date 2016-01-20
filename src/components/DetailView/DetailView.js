'use strict';

var d3 = require('d3')
,   Vec2 = require('svec2')

require('components/DetailView/DetailView.css')

var ViewActions = require('actions/ViewActions')
,   DataUtil = require('util/datautil')
,   svgutil = require('util/svgutil')
,   EnergyTails = require('components/DetailView/EnergyTails')
,   DetailShapes = require('components/DetailView/DetailShapes')
,   AxisStar = require('components/DetailView/AxisStar')
,   Axis = require('components/DetailView/Axis')
,   DetailOverlay = require('components/DetailView/DetailOverlay')

var DetailView = {

  applyDetailLayout(datum, state, layout, yOffset) {
    let timelineDim;
    let timelineYScale;
    let timelineXScale;
    let energyDomain = [0, 1]; // DataUtil.getMinMax(datum.versions, (item) => item.energy || 0)
    let timeDomain = DataUtil.getMinMax(datum.versions, (item) => item.parsedDate);

    if (layout.stackedHeader) {
      timelineDim = {
        x0: layout.tlSidePad,
        x1: window.innerWidth - layout.tlSidePad,
        y0: yOffset + layout.tlTop,
        y1: yOffset + 1000
      };
      timelineXScale = d3.scale.linear().domain(energyDomain).range([timelineDim.x0, timelineDim.x1]);
      timelineYScale = d3.time.scale().domain(timeDomain).range([timelineDim.y0, timelineDim.y1]);
    } else {
      timelineDim = {
        x0: layout.tlSidePad,
        x1: window.innerWidth - layout.tlSidePad,
        y0: yOffset + layout.tlTop,
        y1: yOffset + layout.tlBase
      };
      timelineXScale = d3.time.scale().domain(timeDomain).range([timelineDim.x0, timelineDim.x1]);
      timelineYScale = d3.scale.linear().domain(energyDomain).range([timelineDim.y1, timelineDim.y0]);
    }

    datum.versions.forEach((versionData) => {
      if (layout.stackedHeader) {
        versionData.timelineCX = timelineXScale(versionData.energy);
        versionData.timelineCY = timelineYScale(versionData.parsedDate);
        versionData.timelineBaseY = timelineYScale(versionData.parsedDate);
        versionData.timelineBaseX = timelineDim.x0;
      } else {      
        versionData.timelineCX = timelineXScale(versionData.parsedDate);
        versionData.timelineCY = timelineYScale(versionData.energy);
        versionData.timelineBaseY = timelineDim.y1;
        versionData.timelineBaseX = timelineXScale(versionData.parsedDate);
      }

      if (versionData.isCircle) {
        versionData.tailpt1 = [-versionData.timelinePlanetRadius, 0]
        versionData.tailpt2 = [versionData.timelinePlanetRadius, 0]
      } else {
        var a = Math.floor(versionData.numSides / 2) * 2 * Math.PI / versionData.numSides
        ,   pt1 = new Vec2(-1, 0)
        ,   pt2 = new Vec2(Math.cos(a), Math.sin(a))
        ,   diagonal = Vec2.diff(pt2, pt1)
        ,   rot = Vec2.crossProduct(new Vec2(1, 0), diagonal)
        ,   polyPoints = svgutil.getOffsetPolygonPointsArray(0, 0, versionData.timelinePlanetRadius, versionData.numSides, rot / 2)

        versionData.polygonPoints = polyPoints
        versionData.tailpt1 = polyPoints[0]
        versionData.tailpt2 = polyPoints[Math.ceil(polyPoints.length / 2)]
      }
    });

    return {
      yOffset: yOffset
    , baselineY: timelineDim.y1
    , timelineXScale: timelineXScale
    , timelineYScale: timelineYScale
    , layoutWidth: layout.bodyWidth
    , layoutHeight: Math.max(layout.bodyHeight, timelineDim.y1 + 100)
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

    var excludedSystems = systems.filter((d) => d.songId !== data.songId);

    excludedSystems
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
      .attr('transform', (d) => svgutil.translateString(d.timelineBaseX, d.timelineBaseY))

    var it1 = it0.transition()
      .duration(200)
      .attr('transform', (d) => svgutil.translateString(d.timelineBaseX, d.timelineBaseY) + ' scale(0)')
      .each('end', DataUtil.once(function() {
        // This function can only be called once
        callback()
      }))
      .remove()
  },

  render(node, data, state, dimensions, layout) {
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

    detailEnergyTails.exit()
      .transition('SongSystem-render')
      .duration(500)
      .attr('points', EnergyTails.BaselinePoints)
      .transition('SongSystem--render')
      .duration(200)
      .style('opacity', 0)
      .remove();

    detailEnergyTails.transition('SongSystem-render')
      .duration(200)
      .attr('points', EnergyTails.ExtendedPoints)
      .style('opacity', 1);

    detailEnergyTails.enter().append('polygon')
      .attr('class', 'SongTimeline--energytail')
      .attr('points', EnergyTails.BaselinePoints)
      .transition('SongSystem-render')
      .delay(200)
      .duration(800)
      .attr('points', EnergyTails.ExtendedPoints)
      .style('opacity', 1)

    detailEnergyTails.attr('id', (d) => 'tlenergytail-' + d.versionId)

    var detailPlanetContainer = svgutil.acquire(viewWrapper, 'SongTimeline--planetbox', 'g')

    // new planets
    var detailPlanets = detailPlanetContainer.selectAll('.SongTimeline--planet')
      .data(data.versionsFilteredIn, (d) => d.versionId)

    detailPlanets.exit()
      .transition('SongSystem-render')
      .duration(500)
      .attr('transform', (d) => svgutil.translateString(d.timelineBaseX, d.timelineBaseY))
      .transition('SongSystem-render')
      .duration(200)
      .attr('transform', (d) => svgutil.translateString(d.timelineBaseX, d.timelineBaseY) + 'scale(0)')
      .style('opacity', 0)
      .remove();

    detailPlanets.transition('SongSystem-render')
      .duration(200)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineCY))
      .style('opacity', 1);

    detailPlanets.enter().append('g')
      .attr('class', 'SongTimeline--planet')
      .attr('transform', (d) => svgutil.translateString(d.timelineBaseX, d.timelineBaseY) + ' scale(0)')
      .transition('SongSystem-render')
      .duration(200)
      .attr('transform', (d) => svgutil.translateString(d.timelineBaseX, d.timelineBaseY) + ' scale(1)')
      .style('opacity', 1)
      .transition('SongSystem-render')
      .duration(800)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineCY));

    detailPlanets.attr('id', (d) => 'tlplanetgroup-' + d.versionId)
      .on('mouseenter', this.onPlanetMouseEnter.bind(this, state))
      .on('mouseleave', this.onPlanetMouseLeave);

    // render the shapes
    detailPlanets.call(DetailShapes);

    // detail overlay
    var detailData = state.get('detailOverlay'),
        detailLayer = svgutil.acquire(viewWrapper, 'SongTimeline--detaillayer', 'g');

    if (detailData) {
      detailLayer.datum(detailData)
        .call(DetailOverlay.render, dimensions.timelineXScale.range(), dimensions.yOffset)
    } else {
      detailLayer.call(DetailOverlay.deRender)
    }

    // star
    viewWrapper.call(AxisStar, dimensions.baselineY)

    // axis
    let timeScale = layout.stackedHeader ? dimensions.timelineYScale : dimensions.timelineXScale;
    viewWrapper.call(Axis, dimensions.baselineY, timeScale.domain(), timeScale.range(), data.versionsFilteredIn.map((d) => timeScale(d.parsedDate)))
  },

  onPlanetMouseEnter(state, d) {
    if (d !== state.get('detailOverlay')) {
      ViewActions.hoverOnDetailVersion(d)
    }
  },

  onPlanetMouseLeave(d) {
    // pass
  },

  deRender(node, callback) {
    var d3Node = d3.select(node)

    var dimensions = d3Node.datum()

    d3Node.classed('MainView__detail', false)

    // cancel any incoming transition, if applicable
    d3Node.selectAll('.SongSystem--planet').interrupt().transition()

    var axisMarks = d3Node.selectAll('.SongDetailStar, .SongTimelineAxis')

    axisMarks
      .interrupt('SongSystem-render')
      .transition('SongSystem-render') // cancels current and scheduled transitions

    axisMarks
      .transition('SongSystem-derender')
      .duration(500)
      .style('opacity', 0)
      .remove()

    var energyTails = d3Node.selectAll('.SongTimeline--energytail')

    energyTails
      .interrupt('SongSystem-render')
      .transition('SongSystem-render') // cancels current and scheduled transitions

    var trailT0 = energyTails
      .transition('SongSystem-derender')
      .duration(500)
      .attr('points', EnergyTails.BaselinePoints)
      .remove()

    var timelinePlanets = d3Node.selectAll('.SongTimeline--planet')

    timelinePlanets
      .interrupt('SongSystem-render')
      .transition('SongSystem-render') // cancels current and scheduled transitions

    var t0 = timelinePlanets
      .transition('SongSystem-derender')
      .duration(500)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineBaseY))

    t0.transition('SongSystem-derender')
      .duration(200)
      .style('opacity', 0)
      .remove()
      .each('end', DataUtil.once(function() {
        // This function can only be called once
        callback();
      }));
  }

}

module.exports = DetailView
