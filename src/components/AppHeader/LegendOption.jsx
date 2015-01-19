var React = require('react')

var LegendOption = React.createClass({

  onOptionClick() {
    this.props.clickFunction(this.props.attributeName)
  },

  render() {
    var { isInactive, logoClass, optionLabel, ...other } = this.props
    return (
      <div
        {...other}
        className={"AppHeader--legendoption " + (isInactive ? 'AppHeader--legendoption__inactive' : '')}
        onClick={this.onOptionClick}
      >
        <div className={"AppHeader--legendlogo " + logoClass} />
        <div className="AppHeader--legendlabel" >{optionLabel}</div>
      </div>
    )
  }

})

module.exports = LegendOption
