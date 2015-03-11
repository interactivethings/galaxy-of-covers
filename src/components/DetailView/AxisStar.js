var svgutil = require('util/svgutil')

function AxisStar(selection, yPosition) {
  var star = svgutil.acquire(selection, 'SongDetailStar', 'circle')

  star
    .attr('opacity', 0)
    .attr('cx', 22)
    .attr('r', 8)
    .attr('cy', yPosition)
    .transition()
    .attr('opacity', 1)
}

module.exports = AxisStar;
