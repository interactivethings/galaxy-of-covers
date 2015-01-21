'use strict';

var React = require('react')

var SongTimeline = require('components/SongTimeline/SongTimeline')

require('components/DetailView/DetailView.scss')

var DetailView = React.createClass({

  getSongInfoString(songInfo) {
    var timeDifference = (new Date()).getFullYear() - songInfo.versions[0].parsedDate.getFullYear()
    return songInfo.versions.length + ' covers / ' + timeDifference + ' years old'
  },

  render() {
    // render the detail view
    var titleStyleProps = {
      top: this.props.dynamicState.get('legendOpen') ? this.props.layout.timelineTop + 90 : '10em'
    }

    return (
      <div className="MainView">
        <div className="DetailTitle" style={titleStyleProps} >
          <h2 className="DetailTitle--title">{this.props.songData.title}</h2>
          <h3 className="DetailTitle--info">{this.getSongInfoString(this.props.songData)}</h3>
        </div>
        <svg className="SongDetail" width={this.props.layout.bodyWidth} height={this.props.layout.bodyHeight} >
          <SongTimeline
            dynamicState={this.props.dynamicState}
            songData={this.props.songData}
            scales={this.props.scales}
            layout={this.props.layout}
          />
        </svg>
      </div>
    )
  }

})

module.exports = DetailView
