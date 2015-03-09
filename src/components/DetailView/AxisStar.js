function AxisStar(selection, yPosition) {
  var star = selection.selectAll('.SongDetailStar')
    .data([0])

  if (star.empty()) {
    star = selection.append('circle')
      .attr('class', 'SongDetailStar')
      .attr('opacity', 0)
      .attr('cx', 0)
      .attr('r', 8)
  }

  star
    .attr('cy', yPosition)
    .transition()
    .attr('opacity', 1)
}

module.exports = AxisStar;
