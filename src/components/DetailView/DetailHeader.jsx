'use strict';

var React = require('react')

var DetailHeader = React.createClass({

  getSongInfoString(songInfo) {
    var timeDifference = (new Date()).getFullYear() - songInfo.versions[0].songYear
    return songInfo.versions.length + ' covers / ' + timeDifference + ' years old'
  },

  render() {
    var style = {
      top: this.props.layout.tlHeader
    }

    return (
      <div className="DetailTitle" style={style} >
        <h2 className="DetailTitle--title">{this.props.songData.title}</h2>
        <h3 className="DetailTitle--info">{this.getSongInfoString(this.props.songData)}</h3>
      </div>
    )
  }

})

module.exports = DetailHeader
