'use strict';

var d3 = require('d3')

require('components/DetailView/DetailView.scss')

var DetailView = {

  render(node, data, state) {
    var d3Node = d3.select(node)

    d3Node.selectAll('.SongSystem')
      .transition()
      .style('opacity', 0)
      .remove()

    var planets = d3Node.selectAll('.SongSystem--planet')

    planets.filter((d) => d.songId !== data.songId)
      .style('opacity', 0)
      .remove()

    planets.filter((d) => d.songId === data.songId)
      .transition()
      .duration(7000)
      .attr('transform', () => 'translate(' + (Math.random() * window.innerWidth).toString() + ',' + (Math.random() * window.innerHeight).toString() + ')')

    return true
  }

}

module.exports = DetailView
