/**
 * @jsx React.DOM
 */

var React = require('react')

var App = require('components/App/App')

React.initializeTouchEvents(true)

React.render(
  <App />,
  document.getElementById('main')
)

if (__DEV__) {
  window.React = require('react')
  window.Vec2 = require('util/vec2')
  window.SvgUtil = require('util/SvgUtil')

  var three = SvgUtil.getPolygonPointsArray(0, 0, 17, 3)
  ,   four = SvgUtil.getPolygonPointsArray(0, 0, 17, 4)
  ,   five = SvgUtil.getPolygonPointsArray(0, 0, 17, 5)
  ,   six = SvgUtil.getPolygonPointsArray(0, 0, 17, 6)
  ,   seven = SvgUtil.getPolygonPointsArray(0, 0, 17, 7)
  ,   eight = SvgUtil.getPolygonPointsArray(0, 0, 17, 8)

  console.log( Vec2.crossProduct(Vec2.fromVals(1, 0), Vec2.fromArray(three[Math.floor(three.length / 2)]).normalize() ) * 180 / Math.PI );
  console.log( Vec2.crossProduct(Vec2.fromVals(1, 0), Vec2.fromArray(four[Math.floor(four.length / 2)]).normalize() ) * 180 / Math.PI );
  console.log( Vec2.crossProduct(Vec2.fromVals(1, 0), Vec2.fromArray(five[Math.floor(five.length / 2)]).normalize() ) * 180 / Math.PI );
  console.log( Vec2.crossProduct(Vec2.fromVals(1, 0), Vec2.fromArray(six[Math.floor(six.length / 2)]).normalize() ) * 180 / Math.PI );
  console.log( Vec2.crossProduct(Vec2.fromVals(1, 0), Vec2.fromArray(seven[Math.floor(seven.length / 2)]).normalize() ) * 180 / Math.PI );
  console.log( Vec2.crossProduct(Vec2.fromVals(1, 0), Vec2.fromArray(eight[Math.floor(eight.length / 2)]).normalize() ) * 180 / Math.PI );
}
