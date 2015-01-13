/**
 * @jsx React.DOM
 */

var React = require('react')
,   d3 = require('d3')

require('components/TimelineGenreHeader/TimelineGenreHeader.scss')

var SvgUtil = require('util/svgutil')

var TimelineGenreHeader = React.createClass({

  render() {
    var genreSplit = this.props.genreSplit
    ,   sum = 0

    for (var prop in genreSplit) sum += genreSplit[prop]

    var scale = d3.scale.linear().domain([0, sum]).range([0, this.props.headerWidth])
    ,   cumulative = 0
    ,   colorScale = this.props.colorScale

    return (
      <g className="TimelineGenreHeader" transform={SvgUtil.translateString(0, this.props.yOffset)} >
        {Object.keys(genreSplit).map(function(genre) {
          var v = genreSplit[genre]
          ,   x = scale(cumulative)
          cumulative += v
          return (
            <rect
              x={x}
              y={0}
              width={scale(v)}
              height={12}
              fill={colorScale(genre)}
            />
          )
        })}
      </g>
    )
  }

})

module.exports = TimelineGenreHeader
