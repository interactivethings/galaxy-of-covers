/**
 * @jsx React.DOM
 */

var React = require('react')

require('components/SongSystem/SongSystem.scss')

var SongPlanet = require('components/SongPlanet/SongPlanet')

function translateString(x, y) {
  return 'translate(' + x + ',' + y + ')'
}

function versionId(versionData) {
  return versionData.performer + '-' + versionData.title
}

var SongSystem = React.createClass({

  render() {
    return (
      <g className="SongSystem" transform={translateString(this.props.x, this.props.y)} >
        <circle r="5" />
        {
          this.props.songData.versions.map((versionData, i) => {
            var songProps = {
              orx: 50,
              ory: 50,
              r: 20,
              color: '#0ff',
              rotation: -60
            }

            return <SongPlanet key={versionId(versionData)} {...songProps} />
          })
        }
      </g>
    )
  }
})

module.exports = SongSystem
