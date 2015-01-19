var React = require('react')

require('components/AppHeader/AppHeader.scss')

var ViewActions = require('actions/ViewActions')
,   LegendOption = require('components/AppHeader/LegendOption')

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

  attributeLegendClick(attributeName) {
    ViewActions.highlightAttribute(attributeName)
  },

  render() {
    var dynamicState = this.props.dynamicState
    ,   detail = dynamicState.get('inDetail')
    ,   legend = dynamicState.get('legendOpen')
    ,   about = dynamicState.get('aboutOpen')
    ,   share = dynamicState.get('shareOpen')
    ,   highlightedAttribute = dynamicState.get('highlightedAttribute')

    return (
      <div className="AppHeader" >
        <div className={"AppHeader--legend " + (legend ? 'AppHeader--legend__open' : '')}>
          <LegendOption
            attributeName='popularity'
            isInactive={highlightedAttribute && highlightedAttribute !== 'popularity'}
            logoClass='AppHeader--legendlogo__popularity'
            optionLabel='Popularity'
            clickFunction={this.attributeLegendClick}
          />

          <LegendOption
            attributeName='tempo'
            isInactive={highlightedAttribute && highlightedAttribute !== 'tempo'}
            logoClass='AppHeader--legendlogo__tempo'
            optionLabel='Tempo (BPM)'
            clickFunction={this.attributeLegendClick}
          />

          <LegendOption
            attributeName='valence'
            isInactive={highlightedAttribute && highlightedAttribute !== 'valence'}
            logoClass='AppHeader--legendlogo__valence'
            optionLabel='Valence'
            clickFunction={this.attributeLegendClick}
          />

          <LegendOption
            attributeName='energy'
            isInactive={highlightedAttribute && highlightedAttribute !== 'energy'}
            logoClass='AppHeader--legendlogo__energy'
            optionLabel='Energy'
            clickFunction={this.attributeLegendClick}
          />

          <LegendOption
            attributeName='speechiness'
            isInactive={highlightedAttribute && highlightedAttribute !== 'speechiness'}
            logoClass='AppHeader--legendlogo__speechiness'
            optionLabel='Speechiness'
            clickFunction={this.attributeLegendClick}
          />
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
              <div className={"AppHeader--menuoption " + (legend ? 'AppHeader--menuoption__active' : '')} onClick={this.toggleLegend} >
                <h2 className="AppHeader--navlabel">Legend</h2>
                <span className={"AppHeader-icon " + (legend ? "icon-keyboard-arrow-up" : "icon-keyboard-arrow-down")} />
              </div>
              <div className={"AppHeader--menuoption " + (about ? 'AppHeader--menuoption__active' : '')} onClick={this.toggleAbout} >
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
              <div className="AppHeader--menuoption AppHeader--menuoption__active" >
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
