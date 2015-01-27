'use strict';

var React = require('react')

var ViewFilters = require('util/ViewFilters')
,   GalaxyView = require('components/GalaxyView/GalaxyView')


var MainView = React.createClass({

  componentDidMount() {
    var node = this.getDOMNode()

    ViewFilters.renderFilters(node)
  },

  componentDidUpdate() {
    var data = this.props.displayObjects
    ,   state = this.props.dynamicState
    ,   node = this.getDOMNode()
    ,   dimensions

    if (state.get('inGalaxy')) {
      dimensions = GalaxyView.applyHexLayout(data)
      node.setAttribute('width', dimensions.layoutWidth)
      node.setAttribute('height', dimensions.layoutHeight)
      GalaxyView.render(node, data, state)
    } else if (state.get('inDetail')) {

    }

  },

  render() {
    return (
      <svg className="MainView" key={"dontreplace"} />
    )
  }

})

module.exports = MainView
