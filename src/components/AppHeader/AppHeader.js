'use strict';

var React = require('react')

import css from 'components/AppHeader/AppHeader.css';

var ViewActions = require('actions/ViewActions')
,   Legend = require('components/AppHeader/Legend')
,   GenreHeader = require('components/AppHeader/GenreHeader')
,   AboutPage = require('components/AppHeader/AboutPage')

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

  attributeLegendClick(attributeName) {
    ViewActions.highlightAttribute(attributeName)
  },

  render() {
    var dynamicState = this.props.dynamicState
    ,   inDetail = dynamicState.get('inDetail')
    ,   legendOpen = dynamicState.get('legendOpen')
    ,   aboutOpen = dynamicState.get('aboutOpen')
    ,   highlightedAttribute = dynamicState.get('highlightedAttribute')

    return (
      <div className="AppHeader" >
        <div className="AppHeader--navigation">
          <div className="AppHeader--back" onClick={this.navigateBack} >
            {inDetail ? (
              <div className={`${css.appheaderbackarrow} icon-arrow-back`} />
            ) : ('')}
            <h1 className="AppHeader--title" >Galaxy of Covers</h1>
          </div>
          <div className="AppHeader--menu" >
            <div className={`${css.appheadermenuoption} ` + (legendOpen ? 'AppHeader--menuoption__active' : '')} onClick={this.toggleLegend} >
              <h2 className="AppHeader--navlabel">Legend</h2>
              <span className={"AppHeader-icon " + (legendOpen ? "icon-keyboard-arrow-up" : "icon-keyboard-arrow-down")} />
            </div>
            <div className={`${css.appheadermenuoption} ` + (aboutOpen ? 'AppHeader--menuoption__active' : '')} onClick={this.toggleAbout} >
              <h2 className="AppHeader--navlabel">About</h2>
              <span className={"AppHeader-icon " + (aboutOpen ? "icon-keyboard-arrow-up" : "icon-keyboard-arrow-down")} />
            </div>
            <a><div className={`AppHeader-icon ${css.appheadershareicon} icon-twitter`} /></a>
            <a><div className={`AppHeader-icon ${css.appheadershareicon} icon-facebook`} /></a>
            <a><div className={`AppHeader-icon ${css.appheadershareicon} icon-pinterest`} /></a>
          </div>
        </div>
        <Legend isOpen={legendOpen} inDetail={inDetail} highlighted={highlightedAttribute} onClick={this.attributeLegendClick} state={this.props.dynamicState} />
        <GenreHeader
          isVisible={!aboutOpen}
          genreCount={this.props.genreCount}
          genreList={this.props.genreList}
          headerWidth={this.props.layout.headerWidth}
          dynamicState={this.props.dynamicState}
          scales={this.props.scales} />
        <AboutPage
          isOpen={aboutOpen}
          layout={this.props.layout}
        />
      </div>
    )
  }

})

module.exports = AppHeader
