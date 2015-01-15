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
    ,   sum = Object.keys(genreSplit).reduce((m, k) => m + genreSplit[k], 0)
    ,   scale = d3.scale.linear().domain([0, sum]).range([0, this.props.headerWidth])
    ,   cumulative = 0
    ,   colorScale = this.props.colorScale

    return (
      <g className="TimelineGenreHeader" transform={this.props.transform} >
        {Object.keys(genreSplit).sort().map(function(genre) {
          var v = genreSplit[genre]
          ,   x = scale(cumulative)
          ,   color = colorScale(genre)
          cumulative += v
          return (
            <g transform={SvgUtil.translateString(x, 0)} >
              <rect
                x={0}
                y={0}
                width={scale(v)}
                height={12}
                fill={color}
              />
              <text className="TimelineGenreHeader-genrelabel" fill={color} dx={4} dy={16} >{genre}</text>
            </g>
          )
        })}
      </g>
    )
  }

})

module.exports = TimelineGenreHeader
