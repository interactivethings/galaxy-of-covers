var SvgUtil = require('util/svgutil')

function Axis(selection, yPosition, xDomain, xRange, ticks) {
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

module.exports = Axis;
