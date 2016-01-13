var d3 = require('d3')

var svgutil = require('util/svgutil')
var ViewActions = require('actions/ViewActions')

require('components/DetailView/DetailOverlay.css')

var DEG_TO_RAD = Math.PI / 180

var DetailOverlay = {

  render(selection, xRange, yOffset) {
    var datum = selection.datum()

    var defs = svgutil.acquire(selection, 'DetailOverlay__defs', 'defs')

    var gradient = svgutil.acquire(defs, 'DetailOverlay__gradient', 'linearGradient')
      .attr('id', 'detail-overlay-line-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%')
      .attr('gradientUnits', 'userSpaceOnUse')

    svgutil.acquire(gradient, 'DetailOverlay__stop DetailOverlay__stop--stop1', 'stop')
      .datum(datum)
      .attr('offset', (d) => Math.round(d.timelineCX / (xRange[1] - xRange[0]) * 100) - 80 + '%')

    svgutil.acquire(gradient, 'DetailOverlay__stop DetailOverlay__stop--stop2', 'stop')
      .datum(datum)
      .attr('offset', (d) => Math.round(d.timelineCX / (xRange[1] - xRange[0]) * 100) + '%')

    svgutil.acquire(gradient, 'DetailOverlay__stop DetailOverlay__stop--stop3', 'stop')
      .datum(datum)
      .attr('offset', (d) => Math.round(d.timelineCX / (xRange[1] - xRange[0]) * 100) + 80 + '%')

    var overlay = svgutil.acquire(selection, 'DetailOverlay__shadow', 'rect')

    overlay
      .attr('transform', (d) => svgutil.translateString(0, yOffset))
      .attr('width', '100%')
      .attr('height', '100%')
      .on('mouseover', () => ViewActions.hoverOffDetailVersion())

    var line = svgutil.acquire(selection, 'DetailOverlay__line', 'line')

    line
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', (d) => d.timelineCY)
      .attr('y2', (d) => d.timelineCY)
      .attr('stroke', 'url(#detail-overlay-line-gradient)')

    var marksContainer = svgutil.acquire(selection, 'DetailOverlay__markbox', 'g')

    marksContainer
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineCY))
      .on('mouseleave', () => ViewActions.hoverOffDetailVersion())

/*    var audioElement = svgutil.acquire(marksContainer, 'DetailOverlay--sound', 'audio')

    audioElement
      .attr('autoplay', true)
      .attr('src', (d) => d.spotify.preview + '.mp3')
      .attr('volume', 1)*/

    var audioObj = new Audio(datum.spotify.preview);

    audioObj.play();

    var energyUse = svgutil.acquire(marksContainer, 'DetailOverlay--energyuse', 'use')

    energyUse
      .attr('transform', (d) => svgutil.translateString(-d.timelineCX, -d.timelineCY))
      .attr('xlink:href', (d) => '#' + 'tlenergytail-' + d.versionId)

    var planetUse = svgutil.acquire(marksContainer, 'DetailOverlay--planetuse', 'use')

    planetUse
      .attr('transform', (d) => svgutil.translateString(-d.timelineCX, -d.timelineCY))
      .attr('xlink:href', (d) => '#' + 'tlplanetgroup-' + d.versionId)

    var midLine = svgutil.acquire(marksContainer, 'DetailOverlay__midline', 'line')

    midLine
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', (d) => d.timelineBaseY - d.timelineCY)
      .attr('y2', 0)

    var circle = svgutil.acquire(marksContainer, 'DetailOverlay__axisdot', 'circle')

    circle
      .attr('cx', 0)
      .attr('cy', (d) => d.timelineBaseY - d.timelineCY)
      .attr('r', 4.5)

    var verticalLine = svgutil.acquire(marksContainer, 'DetailOverlay__valencevertical', 'line')

    verticalLine
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', (d) => -(d.timelinePlanetRadius + 8))

    var valenceAngle = svgutil.acquire(marksContainer, 'DetailOverlay__valence', 'line')

    valenceAngle
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d) => Math.cos((d.timelineRotation - 90) * DEG_TO_RAD) * (d.timelinePlanetRadius + 8))
      .attr('y2', (d) => Math.sin((d.timelineRotation - 90) * DEG_TO_RAD) * (d.timelinePlanetRadius + 8))

    var angleIndicator = svgutil.acquire(marksContainer, 'DetailOverlay__angle', 'path')

    angleIndicator
      .attr('d', (d) => {
        var r = d.timelinePlanetRadius + 12
        var a = (d.timelineRotation - 90) * DEG_TO_RAD
        return svgutil.arcString(Math.cos(a) * r, Math.sin(a) * r, r, r, 0, 0, 1, 0, -r)
      })

    var valenceLabel = svgutil.acquire(marksContainer, 'DetailOverlay__label DetailOverlay__label--valence', 'text')

    valenceLabel
      .attr('dy', (d) => -d.timelinePlanetRadius - 10)
      .attr('dx', 4)
      .text((d) => "Valence: " + d3.round(d.echonest.valence, 2))

    var energyLabel = svgutil.acquire(marksContainer, 'DetailOverlay__label DetailOverlay__label--energy', 'text')

    energyLabel
      .attr('dy', (d) => (d.timelineBaseY - d.timelineCY) / 2 + 6)
      .attr('dx', 4)
      .text((d) => "Energy: " + d3.round(d.echonest.energy, 2))

  },

  deRender(selection) {
    svgutil.acquire(selection, 'DetailOverlay__shadow').remove()
    svgutil.acquire(selection, 'DetailOverlay__line').remove()
    svgutil.acquire(selection, 'DetailOverlay__markbox').remove()
  }

}

module.exports = DetailOverlay
