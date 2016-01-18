'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

require('components/AppHeader/GenreHeader.css')

var ViewActions = require('actions/ViewActions')
,   svgutil = require('util/svgutil')
,   DataUtil = require('util/datautil')

var GenreHeader = React.createClass({

  getInitialState() {
    return {
      hoveredGenre: null
    }
  },

  onGenreHover(genre) {
    this.setState({
      hoveredGenre: genre
    })
  },

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

    let revealedGenre = this.props.detailGenre || this.state.hoveredGenre;

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
                opacity={revealedGenre && revealedGenre !== genre ? 0.2 : filteredGenre && filteredGenre !== genre ? 0.2 : 1}
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
      <svg className="GenreHeader" width={this.props.headerWidth} height={48} >
        <g transform={this.props.transform} >
          {this.props.genreList.map((genre) => {
            var n = genreCount[genre] || 0
            ,   p = n / sum
            ,   x = xScale(cumulative)
            cumulative += n

            let showLabel = (this.state.hoveredGenre == genre) ||
                            (this.props.detailGenre == genre) ||
                            (filteredGenre == genre);

            return (
              <ProportionalListing
                key={'genrelisting-'+genre}
                onGenreClick={this.onGenreClick}
                onGenreHover={this.onGenreHover}
                genre={genre}
                x={x}
                opacity={showLabel || !filteredGenre ? 1 : 0.2}
                width={xScale(n)}
                height={20}
                color={colorScale(genre)}
                genreLabel={showLabel ? genre : null}
                genrePercent={showLabel ? n / sum : null} />
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
        <text className='GenreHeader__percentlabel' y={16} x={this.props.totalWidth / 2} >{DataUtil.formatPercent(this.props.value)}</text>
        <text className='GenreHeader__genrelabel' fill={this.props.color} y={40} x={this.props.totalWidth / 2} >{this.props.genre}</text>
      </g>
    )
  }

})

var ProportionalListing = React.createClass({

  propTypes: {
    onGenreClick: React.PropTypes.func,
    onGenreHover: React.PropTypes.func,
    genre: React.PropTypes.string,
    x: React.PropTypes.number,
    opacity: React.PropTypes.number,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    color: React.PropTypes.string,
    genreLabel: React.PropTypes.string,
    genrePercent: React.PropTypes.number
  },

  onClick() {
    this.props.onGenreClick(this.props.genre)
  },

  onMouseEnter() {
    this.props.onGenreHover(this.props.genre)
  },

  onMouseLeave() {
    this.props.onGenreHover(null)
  },

  componentDidUpdate() {
    var label = this.refs.genrelabel
    if (label) {
      var bbox = ReactDOM.findDOMNode(this).getBBox()
      var labelBbox = ReactDOM.findDOMNode(label).getBBox()
      var labelRight = this.props.x + labelBbox.x + labelBbox.width
      if (labelRight > window.innerWidth) {
        ReactDOM.findDOMNode(this.refs.genrelabel).setAttribute('x', this.props.width / 2 - (labelRight - window.innerWidth))
      }
    }
  },

  render() {
    return (
      <g transform={svgutil.translateString(this.props.x, 0)} onClick={this.onClick} fillOpacity={this.props.opacity} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} >
        <rect
          width={this.props.width}
          height={this.props.height}
          fill={this.props.color} />
        {this.props.genreLabel && this.props.genrePercent !== null ?
          [
            <text key='percent' className='GenreHeader__percentlabel' x={this.props.width / 2} y={14} >{DataUtil.formatPercent(this.props.genrePercent)}</text>,
            <text key='genre' className='GenreHeader__genrelabel' ref='genrelabel' fill={this.props.color} x={this.props.width / 2} y={36} >{this.props.genreLabel}</text>
          ]
        : null}
      </g>
    )
  }

})

module.exports = GenreHeader
