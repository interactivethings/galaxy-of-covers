import d3 from 'd3';

import svgutil from 'util/svgutil';

function Axis(selection, yPosition, xDomain, xRange, ticks) {
  var axis = selection.selectAll('.SongTimelineAxis')

  var defs = svgutil.acquire(selection, 'DetailDefs', 'defs')

  var gradient = svgutil.acquire(defs, 'DetailAxis__axisgradient', 'linearGradient')
    .attr('id', 'detail-view-axis-gradient')
    .attr('x1', '0%').attr('x2', '100%')
    .attr('y1', '0%').attr('y2', '0%')
    .attr('gradientUnits', 'userSpaceOnUse');

  svgutil.acquire(gradient, 'DetailAxis__axisstop1', 'stop')
    .attr('stop-color', '#fff')
    .attr('offset', '0%');

  svgutil.acquire(gradient, 'DetailAxis__axisstop2', 'stop')
    .attr('stop-color', '#666666')
    .attr('offset', '100%');

  if (axis.empty()) {
    axis = selection.append('g')
      .attr('class', 'SongTimelineAxis')
      .attr('opacity', 0)
  }

  axis
    .attr('transform', svgutil.translateString(0, yPosition))
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
    .attr('stroke', 'url(#detail-view-axis-gradient)');

  var axisLabels = axis.selectAll('.SongTimelineAxis--label')
    .data(xDomain)

  axisLabels.enter().append('text')
    .attr('class',' SongTimelineAxis--label')

  axisLabels.exit().remove()

  axisLabels
    .attr('x', (d, i) => xRange[i])
    .attr('y', 10)
    .text((d) => d.getFullYear())

  var axisTicks = axis.selectAll('.SongTimelineAxis--line__axistick')
    .data(ticks);

  axisTicks.enter().append('circle')
    .attr('class', 'SongTimelineAxis--line__axistick');

  axisTicks.exit().remove();

  let tickColorScale = d3.scale.linear().domain(xRange).range(['#ffffff', '#666666']);

  axisTicks
    .attr('cx', (d) => d)
    .attr('cy', 0)
    .attr('r', 3.5)
    .attr('stroke', (d) => {
      return tickColorScale(d);
    })

  var firstTick = svgutil.acquire(axis, 'SongTimelineAxis__firsttick', 'circle')

  firstTick
    .attr('cx', d3.min(ticks))
    .attr('cy', 0)
    .attr('r', 3.5)

  var timelineLabel = svgutil.acquire(axis, 'SongTimelineAxis--label SongTimelineAxis--label__timeline', 'text')

  timelineLabel
    .attr('x', (xRange[0] + xRange[1]) / 2)
    .attr('y', 10)
    .text('Timeline')
}

module.exports = Axis;
