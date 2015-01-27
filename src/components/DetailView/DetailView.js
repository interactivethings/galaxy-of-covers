'use strict';

var d3 = require('d3')

require('components/DetailView/DetailView.scss')

var DetailView = {

  render(node, data, state) {
    var d3Node = d3.select(node)

    d3Node.selectAll('.SongSystem--background, .SongSystem--glowingstar, .SongSystem--orbit, .SongSystem--songtitle')
      .transition()
      .style('opacity', 0)
      .remove()

    var planets = d3Node.selectAll('.SongSystem--planet')

    planets.filter((d) => d.songId !== data.songId)
      .transition()
      .style('opacity', 0)
      .remove()

    planets.filter((d) => d.songId == data.songId)
      .attr('transform', 'translate(600,600)')

    return true
  }

}

module.exports = DetailView
