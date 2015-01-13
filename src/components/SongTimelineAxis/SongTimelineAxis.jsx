var React = require('react')

require('components/SongTimelineAxis/SongTimelineAxis.scss')

var SongTimelineAxis = React.createClass({

  render() {
    var scale = this.props.timelineXScale
    ,   [x1, x2] = scale.range()
    ,   [firstYear, lastYear] = scale.domain()
    ,   ticks = this.props.songData.versions.map(function(songData) {
      var xPos = scale(songData.parsedDate)
      return (
        <line className="SongTimelineAxis-line" x1={xPos} x2={xPos} y1={-5} y2={5} stroke="white" />
      )
    })

    return (
      <g className="SongTimelineAxis">
        <line className="SongTimelineAxis-line" x1={x1} x2={x2} y1={0} y2={0} stroke="white" ></line>
        <text className="SongTimelineAxis-label" x={x1} y={10} >{new Date(firstYear).getFullYear()}</text>
        {ticks}
        <text className="SongTimelineAxis-label" x={x2} y={10} >{new Date(lastYear).getFullYear()}</text>
      </g>
    )
  }

})

module.exports = SongTimelineAxis
