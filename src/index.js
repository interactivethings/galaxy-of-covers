var React = require('react')

var App = require('components/App/App')

React.initializeTouchEvents(true)

React.render(
  <App />,
  document.getElementById('main')
)

if (__DEV__) {
  window.React = require('react')
}
