/**
 * @jsx React.DOM
 */

var React = require('react')

var App = require('components/App/App')

React.initializeTouchEvents(true)

React.render(
  <App />,
  document.getElementById('galaxy-vis')
)

if (__DEV__) {
  window.React = React
  window.Immutable = require('Immutable')
}
