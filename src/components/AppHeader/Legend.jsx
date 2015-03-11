'use strict';

var React = require('react')

require('components/AppHeader/Legend.scss')

var LegendOption = require('components/AppHeader/LegendOption')

var basePairs =
[ ['popularity', 'spotify.popularity']
, ['tempo', 'echonest.tempo']
, ['valence', 'echonest.valence']
, ['energy', 'echonest.energy']
, ['speechiness', 'echonest.speechiness']
]

var Legend = React.createClass({

  render() {
    var {isOpen, inDetail, highlighted, onClick} = this.props

    var pairs = basePairs
    ,   detailData = this.props.state.get('detailOverlay')
    if (detailData) {
      console.log(detailData);
      pairs = pairs.map((p) => {
        return p.concat(detailData)
      })
    }

    return (
      <div className={"AppHeader--legend " + (this.props.isOpen ? 'AppHeader--legend__open' : '')}>
      {
        pairs.map((pair) => {
          var optionName = pair[0]
          var legendLabel = ''
          if (detailData) legendLabel = pair[1].split('.').reduce((m, k) => m[k] ? m[k] : m, detailData)
          return (
            <LegendOption
              key={'legendoption-'+optionName}
              attributeName={optionName}
              viewName={inDetail ? 'detail' : 'overview'}
              isInactive={highlighted && highlighted !== optionName}
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
