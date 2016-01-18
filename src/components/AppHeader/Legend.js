'use strict';

var React = require('react')

require('components/AppHeader/Legend.css')

var LegendOption = require('components/AppHeader/LegendOption')

var basePairs =
[ ['popularity', 'spotify.popularity', 'Popularity', 'A measure of the popularity of the song.']
, ['tempo', 'echonest.tempo', 'Tempo', 'The speed of the song.']
, ['valence', 'echonest.valence', 'Valence', 'A measure of the attitude of the song - high valence means a positive attitude, and low means a more negative one.']
, ['energy', 'echonest.energy', 'Energy', 'A measure of the energy and force of the music.']
, ['speechiness', 'echonest.speechiness', '&ndash; Speechiness +', 'A measure of how close the song is to ordinary speech.']
]

var Legend = React.createClass({

  render() {
    const {isOpen, inDetail, highlighted, onClick} = this.props

    let pairs = basePairs;
    let detailData = this.props.state.get('detailOverlay') || this.props.state.get('hoveredGalaxySong');

    return (
      <div className={"AppHeader--legend " + (this.props.isOpen ? 'AppHeader--legend__open' : '')}>
      {
        pairs.map((pair) => {
          var optionName = pair[0]
          var legendLabel = false

          if (detailData) {
            legendLabel = pair[1].split('.').reduce((m, k) => m[k] ? m[k] : m, detailData);
          }

          return (
            <LegendOption
              key={'legendoption-'+optionName}
              attributeName={optionName}
              viewName={inDetail ? 'detail' : 'overview'}
              isInactive={highlighted && highlighted !== optionName}
              displayName={pair[2]}
              label={legendLabel}
              clickFunction={onClick}
              tooltip={pair[3]}
            />
          )
        })
      }
      </div>
    )
  }

})

module.exports = Legend
