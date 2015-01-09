/**
 * @jsx React.DOM
 */

var React = require('react')

require('components/AppHeader/AppHeader.scss')

var ViewActions = require('actions/ViewActions')

var AppHeader = React.createClass({

  navigateBack() {
    ViewActions.navToGalaxy()
  },

  render() {
    return (
      <div className="AppHeader" >
        <h1 className="AppTitle" onClick={this.navigateBack} >A Galaxy of Covers</h1>
      </div>
    )
  }

})

module.exports = AppHeader
