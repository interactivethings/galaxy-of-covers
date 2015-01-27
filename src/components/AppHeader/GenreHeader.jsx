'use strict';

var React = require('react')
,   d3 = require('d3')

require('components/AppHeader/GenreHeader.scss')

var ViewActions = require('actions/ViewActions')
,   SvgUtil = require('util/svgutil')
,   DataUtil = require('util/datautil')

var GenreHeader = React.createClass({

  onGenreClick(genre) {
    ViewActions.registerGenreClick(genre)
  },

  render() {
    var genreCount = this.props.genreCount
    ,   keys = Object.keys(genreCount)
    ,   sum = keys.reduce((m, k) => m + genreCount[k], 0)
    ,   total = keys.length
    ,   xScale = d3.scale.linear().domain([0, sum]).range([0, this.props.headerWidth])
    ,   colorScale = this.props.scales ? this.props.scales.getColorScale() : x => x
    ,   legendOpen = this.props.dynamicState.get('legendOpen')
    ,   genreFilter = this.props.dynamicState.get('filteredGenres')
    ,   clickFunction = this.onGenreClick
    ,   cumulative = 0

    return (
      <svg className="GenreHeader" width={this.props.headerWidth} height={50} >
        <g transform={this.props.transform} >
          {Object.keys(genreCount).sort().map(function(genre) {
            var n = genreCount[genre]
            ,   p = n / sum
            ,   x = xScale(cumulative)
            ,   color = colorScale(genre)
            ,   barHeight = legendOpen ? 24 : 12
            cumulative += n
            return (
              <GenreListing
                key={'genrelisting-'+genre}
                genre={genre}
                onGenreClick={clickFunction}
                x={x}
                width={xScale(n)}
                height={barHeight}
                color={color}
                showValue={legendOpen}
                value={p}
                opacity={genreFilter.get(genre) ? 0.2 : 1}
              />
            )
          })}
        </g>
      </svg>
    )
  }

})

var GenreListing = React.createClass({

  onClick() {
    this.props.onGenreClick(this.props.genre)
  },

  render() {
    return (
      <g transform={SvgUtil.translateString(this.props.x, 0)} onClick={this.onClick} fillOpacity={this.props.opacity} >
        <rect
          width={this.props.width}
          height={this.props.height}
          fill={this.props.color}
        />
        {this.props.showValue ? <text className="GenreHeader--valuelabel" dx={4} dy={this.props.height / 2} >{DataUtil.formatPercent(this.props.value)}</text> : null}
        <text className="GenreHeader--genrelabel" fill={this.props.color} dx={4} dy={this.props.height + 4} >{this.props.genre}</text>
      </g>
    )
  }

})

module.exports = GenreHeader
