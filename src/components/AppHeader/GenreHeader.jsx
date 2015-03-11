'use strict';

var React = require('react')
,   d3 = require('d3')

require('components/AppHeader/GenreHeader.scss')

var ViewActions = require('actions/ViewActions')
,   svgutil = require('util/svgutil')
,   DataUtil = require('util/datautil')

var GenreHeader = React.createClass({

  onGenreClick(genre) {
    ViewActions.registerGenreClick(genre)
  },

  render() {
    if (!this.props.isVisible) return null

    var genreCount = this.props.genreCount
    ,   colorScale = this.props.scales ? this.props.scales.getColorScale() : (x => x)
    ,   filteredGenre = this.props.dynamicState.get('filteredGenre')

    if (this.props.dynamicState.get('legendOpen')) {
      return this.makeOpenGenreHeader(genreCount, colorScale, filteredGenre)
    } else {
      return this.makeClosedGenreHeader(genreCount, colorScale, filteredGenre)
    }
  },

  makeOpenGenreHeader(genreCount, colorScale, filteredGenre) {
    var individualWidth = this.props.headerWidth / this.props.genreList.length
    ,   sum = d3.sum(Object.keys(genreCount), (k) => genreCount[k])
    ,   xScale = d3.scale.linear().domain([0, sum]).range([0, individualWidth])

    return (
      <svg className="GenreHeader" width={this.props.headerWidth} height={48} >
        <rect className='GenreHeader__bgrect' height={24} width={this.props.headerWidth} />
        <g transform={this.props.transform} >
          {this.props.genreList.map((genre, i) => {
            var n = genreCount[genre] || 0
            return (
              <PercentListing
                key={'genrelisting-'+genre}
                onGenreClick={this.onGenreClick}
                genre={genre}
                x={i * individualWidth}
                totalWidth={individualWidth}
                height={24}
                color={colorScale(genre)}
                barWidth={xScale(n)}
                opacity={!filteredGenre || filteredGenre === genre ? 1 : 0.2}
                value={n / sum} />
            )
          })}
        </g>
      </svg>
    )
  },

  makeClosedGenreHeader(genreCount, colorScale, filteredGenre) {
    var sum = d3.sum(Object.keys(genreCount), (k) => genreCount[k])
    ,   xScale = d3.scale.linear().domain([0, sum]).range([0, this.props.headerWidth])
    ,   cumulative = 0

    return (
      <svg className="GenreHeader" width={this.props.headerWidth} height={20} >
        <g transform={this.props.transform} >
          {this.props.genreList.map((genre) => {
            var n = genreCount[genre] || 0
            ,   p = n / sum
            ,   x = xScale(cumulative)
            cumulative += n
            return (
              <ProportionalListing
                key={'genrelisting-'+genre}
                onGenreClick={this.onGenreClick}
                genre={genre}
                x={x}
                opacity={!filteredGenre || filteredGenre === genre ? 1 : 0.2}
                width={xScale(n)}
                height={20}
                color={colorScale(genre)} />
            )
          })}
        </g>
      </svg>
    )
  }

})

var PercentListing = React.createClass({

  propTypes: {
    onGenreClick: React.PropTypes.func,
    genre: React.PropTypes.string,
    x: React.PropTypes.number,
    totalWidth: React.PropTypes.number,
    height: React.PropTypes.number,
    color: React.PropTypes.string,
    barWidth: React.PropTypes.number,
    opacity: React.PropTypes.number,
    value: React.PropTypes.number
  },

  onClick() {
    this.props.onGenreClick(this.props.genre)
  },

  render() {
    return (
      <g transform={svgutil.translateString(this.props.x, 0)} onClick={this.onClick} opacity={this.props.opacity} >
        <rect
          width={this.props.totalWidth}
          height={this.props.height}
          fill={this.props.color}
          opacity={0.2} />
        <rect
          width={this.props.barWidth}
          height={this.props.height}
          fill={this.props.color} />
        <rect className='GenreHeader__clickbg'
          y={this.props.height}
          width={this.props.totalWidth}
          height={this.props.height}
          fill='transparent' />
        <text className='GenreHeader__percentlabel' dy={16} dx={this.props.totalWidth / 2} >{DataUtil.formatPercent(this.props.value)}</text>
        <text className='GenreHeader__genrelabel' fill={this.props.color} dy={40} dx={this.props.totalWidth / 2} >{this.props.genre}</text>
      </g>
    )
  }

})

var ProportionalListing = React.createClass({

  propTypes: {
    onGenreClick: React.PropTypes.func,
    genre: React.PropTypes.string,
    x: React.PropTypes.number,
    opacity: React.PropTypes.number,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    color: React.PropTypes.string
  },

  onClick() {
    this.props.onGenreClick(this.props.genre)
  },

  render() {
    return (
      <g transform={svgutil.translateString(this.props.x, 0)} onClick={this.onClick} fillOpacity={this.props.opacity} >
        <rect
          width={this.props.width}
          height={this.props.height}
          fill={this.props.color} />
      </g>
    )
  }

})

module.exports = GenreHeader
