var React = require('react')

var SvgUtil = require('util/svgutil')
,   SongTimeline = require('components/SongTimeline/SongTimeline')
,   SongSystem = require('components/SongSystem/SongSystem')
,   ViewActions = require('actions/ViewActions')
,   GalaxyView = require('components/GalaxyView/GalaxyView')
,   DetailView = require('components/DetailView/DetailView')
,   TimelineGenreHeader = require('components/TimelineGenreHeader/TimelineGenreHeader')

var App = React.createClass({

  render() {
    if (this.props.dynamicState.get('inDetail')) {
      return (
        <DetailView
          headerHeight={this.props.headerHeight}
          legendHeight={this.props.legendHeight}
          bodyHeight={this.props.bodyHeight}
          bodyWidth={window.innerWidth}
          dynamicState={this.props.dynamicState}
          scales={this.props.scales}
          songs={this.props.songs}
        />
      )
    } else {
      return (
        <GalaxyView
          headerHeight={this.props.headerHeight}
          legendHeight={this.props.legendHeight}
          dynamicState={this.props.dynamicState}
          scales={this.props.scales}
          songs={this.props.songs}
          genreCount={this.props.genreCount}
        />
      )
    }
  }

})

module.exports = App
