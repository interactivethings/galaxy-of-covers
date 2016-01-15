'use strict';

var React = require('react')

import css from 'components/AppHeader/LegendOption.css';

var datautil = require('util/datautil')
var LegendIcon = require('components/AppHeader/LegendIcon')

var LegendOption = React.createClass({

  onOptionClick() {
    this.props.clickFunction(this.props.attributeName)
  },

  render() {
    var { isInactive, viewName, iconName, optionLabel, ...other } = this.props
    return (
      <div
        {...other}
        className={"AppHeader--legendoption " + (isInactive ? 'AppHeader--legendoption__inactive' : '')}
        onClick={this.onOptionClick}
      >
        <LegendIcon icon={this.props.viewName + '_' + this.props.attributeName} />
        <div className={css.legenddisplayname} dangerouslySetInnerHTML={{ __html: this.props.displayName }}></div>
        {!this.props.label ?
          <div className='AppHeader--legendlabel AppHeader--legendlabel__invisible' />
        :
          <div className='AppHeader--legendlabel' >{datautil.formatLegendData(this.props.label, this.props.attributeName)}</div>
        }
      </div>
    )
  }

})

module.exports = LegendOption
