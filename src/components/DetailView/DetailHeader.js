'use strict';

var React = require('react')

require('components/DetailView/DetailHeader.css')

var DetailHeader = React.createClass({

  getSongInfoString(songInfo) {
    var timeDifference = (new Date()).getFullYear() - songInfo.versions[0].songYear
    return songInfo.versions.length + ' covers / ' + timeDifference + ' years old'
  },

  render() {
    var style = {
      top: this.props.layout.tlHeader
    }

    var detailData, songInfoString
    if (detailData = this.props.state.get('detailOverlay')) {
      songInfoString = detailData.versionPerformer
    } else {
      songInfoString = this.getSongInfoString(this.props.songData)
    }

    return (
      <div className="DetailTitle" style={style} >
        <h2 className="DetailTitle--title">{this.props.songData.title}</h2>
        <h3 className="DetailTitle--info">{songInfoString}</h3>
      </div>
    )
  }

})

module.exports = DetailHeader
