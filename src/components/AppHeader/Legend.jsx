var React = require('react')

require('components/AppHeader/Legend.scss')

var LegendOption = require('components/AppHeader/LegendOption')

var pairs =
[ ['popularity', 'Popularity']
, ['tempo', 'Tempo (BPM)']
, ['valence', 'Valence']
, ['energy', 'Energy']
, ['speechiness', 'Speechiness']
]

var Legend = React.createClass({

  render() {
    var {isOpen, inDetail, highlighted, onClick} = this.props

    return (
      <div className={"AppHeader--legend " + (this.props.isOpen ? 'AppHeader--legend__open' : '')}>
      {
        pairs.map((pair) => {
          return (
            <LegendOption
              attributeName={pair[0]}
              viewName={inDetail ? 'detail' : 'overview'}
              isInactive={highlighted && highlighted !== pair[0]}
              optionLabel={pair[1]}
              clickFunction={onClick}
            />
          )
        })
      }
      </div>
    )
  }

})

module.exports = Legend
