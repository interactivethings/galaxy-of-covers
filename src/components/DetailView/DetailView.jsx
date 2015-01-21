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
    var dim =
        { height: this.props.layout.bodyHeight
        , width: this.props.layout.bodyWidth
        }
    ,   selectedSong = this.props.songData
    ,   timelineBaselineY = dim.height * 4 / 5
    ,   timelineHighlineY = this.props.dynamicState.get('legendOpen') ? this.props.layout.headerHeight + this.props.layout.legendHeight : this.props.layout.headerHeight
    ,   leftTimelinePadding = 100

    var titleStyleProps = {
      top: this.props.dynamicState.get('legendOpen') ? timelineHighlineY + 90 : '10em'
    }

    return (
      <div className="MainView">
        <div className="DetailTitle" style={titleStyleProps} >
          <h2 className="DetailTitle--title">{selectedSong.title}</h2>
          <h3 className="DetailTitle--info">{this.getSongInfoString(selectedSong)}</h3>
        </div>
        <svg className="SongDetail" width={dim.width} height={dim.height} >
          <SongTimeline
            dynamicState={this.props.dynamicState}
            songData={selectedSong}
            scales={this.props.scales}
            timelineBaselineY={timelineBaselineY}
            timelineHighlineY={timelineHighlineY}
            timelineTotalWidth={dim.width}
            timelineXRange={[leftTimelinePadding, dim.width - leftTimelinePadding]}
          />
        </svg>
      </div>
    )
  }

})

module.exports = DetailView
