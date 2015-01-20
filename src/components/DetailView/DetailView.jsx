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
        { height: this.props.bodyHeight
        , width: window.innerWidth
        }
    ,   detailId = this.props.dynamicState.get('detailSystemId')
    ,   selectedSong = this.props.songs.filter((songData) => songData.id === detailId )[0]
    ,   timelineBaselineY = this.props.bodyHeight * 4 / 5
    ,   timelineHighlineY = this.props.dynamicState.get('legendOpen') ? this.props.headerHeight + this.props.legendHeight : this.props.headerHeight
    ,   leftTimelinePadding = 100

    var styleProps = {
      top: this.props.dynamicState.get('legendOpen') ? timelineHighlineY + 90 : '10em'
    }

    return (
      <div className="MainView">
        <div className="DetailTitle" style={styleProps} >
          <h2 className="DetailTitle--title">{selectedSong.title}</h2>
          <h3 className="DetailTitle--info">{this.getSongInfoString(selectedSong)}</h3>
        </div>
        <svg className="SongDetail" width={this.props.bodyWidth} height={this.props.bodyHeight} >
          <SongTimeline
            dynamicState={this.props.dynamicState}
            songData={selectedSong}
            scales={this.props.scales}
            timelineBaselineY={timelineBaselineY}
            timelineHighlineY={timelineHighlineY}
            timelineTotalWidth={this.props.bodyWidth}
            timelineXRange={[leftTimelinePadding, this.props.bodyWidth - leftTimelinePadding]}
          />
        </svg>
      </div>
    )
  }

})

module.exports = DetailView
