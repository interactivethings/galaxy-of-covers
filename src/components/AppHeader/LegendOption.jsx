var React = require('react')

require('components/AppHeader/LegendOption.scss')

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
        <div className="AppHeader--legendlabel" >{optionLabel}</div>
      </div>
    )
  }

})

module.exports = LegendOption
