var React = require('react')

var SvgUtil = require('util/svgutil')
,   SongTimeline = require('components/SongTimeline/SongTimeline')
,   SongSystem = require('components/SongSystem/SongSystem')
,   ViewActions = require('actions/ViewActions')
,   GalaxyView = require('components/GalaxyView/GalaxyView')
,   DetailView = require('components/DetailView/DetailView')

var App = React.createClass({

  render() {
    if (this.props.dynamicState.get('inDetail')) {
      return (
        <DetailView
          layout={this.props.layout}
          dynamicState={this.props.dynamicState}
          scales={this.props.scales}
          songData={this.props.detailData}
        />
      )
    } else {
      return (
        <GalaxyView
          layout={this.props.layout}
          dynamicState={this.props.dynamicState}
          scales={this.props.scales}
          songs={this.props.songs}
        />
      )
    }
  }

})

module.exports = App
