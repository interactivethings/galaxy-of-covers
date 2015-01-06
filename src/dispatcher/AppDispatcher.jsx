var {Dispatcher} = require('flux')

var AppDispatcher = new Dispatcher()

AppDispatcher.handleDataAction = function(action) {
  this.dispatch({
    actionSource: 'DATA_ACTION',
    action
  })
}

AppDispatcher.handleViewAction = function(action) {
  this.dispatch({
    actionSource: 'VIEW_ACTION',
    action
  })
}

module.exports = AppDispatcher
