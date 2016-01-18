'use strict';

var React = require('react')

require('components/AppHeader/Legend.css')

var LegendOption = require('components/AppHeader/LegendOption')

var basePairs =
[ ['popularity', 'spotify.popularity', 'Popularity']
, ['tempo', 'echonest.tempo', 'Tempo']
, ['valence', 'echonest.valence', 'Valence']
, ['energy', 'echonest.energy', 'Energy']
, ['speechiness', 'echonest.speechiness', '&ndash; Speechiness +']
]

var Legend = React.createClass({

  render() {
    const {isOpen, inDetail, highlighted, onClick} = this.props

    let pairs = basePairs;
    let detailData;
    if ((detailData = this.props.state.get('detailOverlay')) || (detailData = this.props.state.get('hoveredGalaxySong'))) {
      pairs = pairs.map((p) => {
        return p.concat(detailData)
      })
    }

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
              clickFunction={onClick} />
          )
        })
      }
      </div>
    )
  }

})

module.exports = Legend
