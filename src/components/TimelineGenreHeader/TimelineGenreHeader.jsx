var React = require('react')
,   d3 = require('d3')

require('components/TimelineGenreHeader/TimelineGenreHeader.scss')

var SvgUtil = require('util/svgutil')
,   DataUtil = require('util/datautil')

var TimelineGenreHeader = React.createClass({

  render() {
    var genreSplit = this.props.genreSplit
    ,   keys = Object.keys(genreSplit)
    ,   sum = keys.reduce((m, k) => m + genreSplit[k], 0)
    ,   total = keys.length
    ,   scale = d3.scale.linear().domain([0, sum]).range([0, this.props.headerWidth])
    ,   cumulative = 0
    ,   colorScale = this.props.colorScale
    ,   legendOpen = this.props.dynamicState.get('legendOpen')

    return (
      <g className="TimelineGenreHeader" transform={this.props.transform} >
        {Object.keys(genreSplit).sort().map(function(genre) {
          var v = genreSplit[genre]
          ,   p = v / sum
          ,   x = scale(cumulative)
          ,   color = colorScale(genre)
          ,   barHeight = legendOpen ? 24 : 12
          cumulative += v
          return (
            <g transform={SvgUtil.translateString(x, 0)} >
              <rect
                x={0}
                y={0}
                width={scale(v)}
                height={barHeight}
                fill={color}
              />
              {legendOpen ? <text className="TimelineGenreHeader--valuelabel" dx={4} dy={barHeight / 2} >{DataUtil.formatPercent(p)}</text> : null}
              <text className="TimelineGenreHeader--genrelabel" fill={color} dx={4} dy={legendOpen ? 28 : 16} >{genre}</text>
            </g>
          )
        })}
      </g>
    )
  }

})

module.exports = TimelineGenreHeader
