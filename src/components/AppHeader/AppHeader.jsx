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
    if (this.props.dynamicState.get('legendOpen')) {
      ViewActions.hideLegend()
    } else {
      ViewActions.showLegend()
    }
  },

  toggleAbout() {
    if (this.props.dynamicState.get('aboutOpen')) {
      ViewActions.hideAbout()
    } else {
      ViewActions.showAbout()
    }
  },

  openShare() {
    ViewActions.openShare()
  },

  closeShare() {
    ViewActions.closeShare()
  },

  render() {
    var dynamicState = this.props.dynamicState
    ,   detail = dynamicState.get('inDetail')
    ,   legend = dynamicState.get('legendOpen')
    ,   about = dynamicState.get('aboutOpen')
    ,   share = dynamicState.get('shareOpen')

    return (
      <div className="AppHeader" >
        <div className={"AppHeader--legend " + (legend ? 'AppHeader--legend__open' : '')}>
          <div className="AppHeader--legendoption">
            <div className="AppHeader--legendlogo AppHeader--legendlogo__popularity" />
            <div className="AppHeader--legendlabel" >Popularity</div>
          </div>
          <div className="AppHeader--legendoption">
            <div className="AppHeader--legendlogo AppHeader--legendlogo__tempo" />
            <div className="AppHeader--legendlabel" >Tempo (BPM)</div>
          </div>
          <div className="AppHeader--legendoption">
            <div className="AppHeader--legendlogo AppHeader--legendlogo__valence" />
            <div className="AppHeader--legendlabel" >Valence</div>
          </div>
          <div className="AppHeader--legendoption">
            <div className="AppHeader--legendlogo AppHeader--legendlogo__energy" />
            <div className="AppHeader--legendlabel" >Energy</div>
          </div>
          <div className="AppHeader--legendoption">
            <div className="AppHeader--legendlogo AppHeader--legendlogo__speechiness" />
            <div className="AppHeader--legendlabel" >Speechiness</div>
          </div>
        </div>
        <div className="AppHeader--navigation">
          <div className="AppHeader--back" onClick={this.navigateBack} >
            {detail ? (
              <div className="AppHeader--backarrow icon-arrow-back" />
            ) : ('')}
            <h1 className="AppHeader--title" >A Galaxy of Covers</h1>
          </div>
          {!share ? (
            <div className="AppHeader--menu" >
              <div className="AppHeader--menuoption" onClick={this.toggleLegend} >
                <h2 className="AppHeader--navlabel">Legend</h2>
                <span className={"AppHeader-icon " + (legend ? "icon-keyboard-arrow-up" : "icon-keyboard-arrow-down")} />
              </div>
              <div className="AppHeader--menuoption" onClick={this.toggleAbout} >
                <h2 className="AppHeader--navlabel">About</h2>
                <span className={"AppHeader-icon " + (about ? "icon-keyboard-arrow-up" : "icon-keyboard-arrow-down")} />
              </div>
              <div className="AppHeader--menuoption" onClick={this.openShare} >
                <h2 className="AppHeader--navlabel">Share</h2>
                <span className="AppHeader-icon icon-add" />
              </div>
            </div>
          ) : (
            <div className="AppHeader--menu" >
              <div className="AppHeader--menuoption" >
                <h2 className="AppHeader--navlabel" onClick={this.closeShare} >Share</h2>
                <span className="AppHeader-icon icon-close" onClick={this.closeShare} />
                <div className="AppHeader-icon AppHeader-shareicon icon-twitter" />
                <div className="AppHeader-icon AppHeader-shareicon icon-facebook" />
                <div className="AppHeader-icon AppHeader-shareicon icon-pinterest" />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

})

module.exports = AppHeader
