function AxisStar(selection, yPosition) {
  var star = selection.selectAll('.SongDetailStar')

  if (star.empty()) {
    star = selection.append('circle')
      .attr('class', 'SongDetailStar')
      .attr('opacity', 0)
      .attr('cx', 22)
      .attr('r', 8)
      .transition()
      .attr('opacity', 1)
  }

  star
    .attr('cy', yPosition)
}

module.exports = AxisStar;
