import React from 'react';
import ReactDOM from 'react-dom';

var App = require('components/App/App')


ReactDOM.render(<App />, document.getElementById('main'));

if (__DEV__) {
  window.React = React;
}
