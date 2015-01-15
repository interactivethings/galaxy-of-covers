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

  toggleLegend() {

  },

  toggleAbout() {

  },

  openShare() {
    ViewActions.openShare()
  },

  closeShare(e) {
    ViewActions.closeShare()
    e.stopPropagation()
  },

  render() {
    var dynamicState = this.props.dynamicState

    return (
      <div className="AppHeader" >
        <div className="AppHeader--back" onClick={this.navigateBack} >
          <h1 className="AppHeader--title" >A Galaxy of Covers</h1>
        </div>
        {!dynamicState.get('shareOpen') ? (
          <div className={"AppHeader--navigation"} >
            <div className="AppHeader--navoption" onClick={this.toggleLegend} >
              <h2 className="AppHeader--navlabel">{"Legend"}</h2>
              <span className={"AppHeader-icon " + (dynamicState.get('legendOpen') ? "icon-keyboard-arrow-up" : "icon-keyboard-arrow-down")} />
            </div>
            <div className="AppHeader--navoption" onClick={this.toggleAbout} >
              <h2 className="AppHeader--navlabel">{"About"}</h2>
              <span className={"AppHeader-icon " + (dynamicState.get('aboutOpen') ? "icon-keyboard-arrow-up" : "icon-keyboard-arrow-down")} />
            </div>
            <div className="AppHeader--navoption" onClick={this.openShare} >
              <h2 className="AppHeader--navlabel">{"Share"}</h2>
              <span className="AppHeader-icon icon-add" />
            </div>
          </div>
        ) : (
          <div className={"AppHeader--navigation"} >
            <div className="AppHeader--navoption" >
              <h2 className="AppHeader--navlabel" onClick={this.closeShare} >{"Share"}</h2>
              <span className="AppHeader-icon icon-close" onClick={this.closeShare} />
              <div className="AppHeader-icon AppHeader-shareicon icon-twitter" />
              <div className="AppHeader-icon AppHeader-shareicon icon-facebook" />
              <div className="AppHeader-icon AppHeader-shareicon icon-pinterest" />
            </div>
          </div>
        )}
      </div>
    )
  }

})

module.exports = AppHeader
