'use strict';

var React = require('react')

require('components/AppHeader/LegendIcon.css');

var iconNames =
  [ 'detail_energy'
  , 'detail_popularity'
  , 'detail_speechiness'
  , 'detail_tempo'
  , 'detail_valence'
  , 'overview_energy'
  , 'overview_popularity'
  , 'overview_speechiness'
  , 'overview_tempo'
  , 'overview_valence'
  ]
,   icons = {}

iconNames.forEach(icon =>
  icons[icon] = require('!raw!assets/legendicons/ic_'+icon+'.svg')
)

var Icon = React.createClass({

  propTypes: {
    icon: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <div className={'AppHeader__legendicon LegendIcon--' + this.props.icon} dangerouslySetInnerHTML={{ __html: icons[this.props.icon] }} />
    )
  }
})

module.exports = Icon
