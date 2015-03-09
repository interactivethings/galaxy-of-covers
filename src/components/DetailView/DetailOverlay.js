var svgutil = require('util/svgutil')

require('components/DetailView/DetailOverlay.scss')

var DEG_TO_RAD = Math.PI / 180

var DetailOverlay = {

  render(selection) {
    console.log(selection.datum());

    var midLine = svgutil.acquire(selection, 'DetailOverlay__midline', 'line')
      .datum(selection.datum())

    midLine
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', (d) => d.timelineBaseY - d.timelineCY)
      .attr('y2', 0)

    var circle = svgutil.acquire(selection, 'DetailOverlay__axisdot', 'circle')

    circle
      .attr('cx', 0)
      .attr('cy', (d) => d.timelineBaseY - d.timelineCY)
      .attr('r', 4.5)

    var verticalLine = svgutil.acquire(selection, 'DetailOverlay__valencevertical', 'line')

    verticalLine
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', (d) => -(d.timelinePlanetRadius + 8))

    var valenceAngle = svgutil.acquire(selection, 'DetailOverlay__valence', 'line')

    valenceAngle
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d) => Math.cos((d.timelineRotation - 90) * DEG_TO_RAD) * (d.timelinePlanetRadius + 8))
      .attr('y2', (d) => Math.sin((d.timelineRotation - 90) * DEG_TO_RAD) * (d.timelinePlanetRadius + 8))

    var angleIndicator = svgutil.acquire(selection, 'DetailOverlay__angle', 'path')

    angleIndicator
      .attr('d', (d) => {
        var r = d.timelinePlanetRadius + 12
        var a = (d.timelineRotation - 90) * DEG_TO_RAD
        return svgutil.arcString(Math.cos(a) * r, Math.sin(a) * r, r, r, 0, 0, 1, 0, -r)
      })

  },

  deRender(selection) {
    svgutil.acquire(selection, 'DetailOverlay__midline').remove()
    svgutil.acquire(selection, 'DetailOverlay__axisdot').remove()
    svgutil.acquire(selection, 'DetailOverlay__valencevertical').remove()
    svgutil.acquire(selection, 'DetailOverlay__valence').remove()
    svgutil.acquire(selection, 'DetailOverlay__angle').remove()
  }

}

module.exports = DetailOverlay
