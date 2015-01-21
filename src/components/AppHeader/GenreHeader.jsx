var React = require('react')
,   d3 = require('d3')

require('components/AppHeader/GenreHeader.scss')

var SvgUtil = require('util/svgutil')
,   DataUtil = require('util/datautil')

var GenreHeader = React.createClass({

  render() {
    var genreCount = this.props.genreCount
    ,   keys = Object.keys(genreCount)
    ,   sum = keys.reduce((m, k) => m + genreCount[k], 0)
    ,   total = keys.length
    ,   xScale = d3.scale.linear().domain([0, sum]).range([0, this.props.headerWidth])
    ,   colorScale = this.props.scales ? this.props.scales.getColorScale() : x => x
    ,   legendOpen = this.props.dynamicState.get('legendOpen')
    ,   cumulative = 0

    return (
      <svg className="GenreHeader" width={this.props.headerWidth} height={50} >
        <g transform={this.props.transform} >
          {Object.keys(genreCount).sort().map(function(genre) {
            var v = genreCount[genre]
            ,   p = v / sum
            ,   x = xScale(cumulative)
            ,   color = colorScale(genre)
            ,   barHeight = legendOpen ? 24 : 12
            cumulative += v
            return (
              <g transform={SvgUtil.translateString(x, 0)} >
                <rect
                  x={0}
                  y={0}
                  width={xScale(v)}
                  height={barHeight}
                  fill={color}
                />
                {legendOpen ? <text className="GenreHeader--valuelabel" dx={4} dy={barHeight / 2} >{DataUtil.formatPercent(p)}</text> : null}
                <text className="GenreHeader--genrelabel" fill={color} dx={4} dy={legendOpen ? 28 : 16} >{genre}</text>
              </g>
            )
          })}
        </g>
      </svg>
    )
  }

})

module.exports = GenreHeader
