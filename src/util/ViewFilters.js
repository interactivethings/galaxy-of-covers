var d3 = require('d3')

var Constants = require('Constants')

var ViewFilters = {

  renderFilters(svgNode) {
    var d3Node = d3.select(svgNode).append('defs')

    var energyTailFade = d3Node.append('linearGradient')
      .attr('id', 'energyTailFade')
      .attr('x1', 0.5)
      .attr('y1', 0)
      .attr('x2', 0.5)
      .attr('y2', 1)
    energyTailFade.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', "rgba(255,255,255,0.5)")
    energyTailFade.append('stop')
      .attr('offset', "100%")
      .attr('stop-color', "rgba(255,255,255,0.05)")

    var starGlow = d3Node.append('filter')
      .attr('id', "starGlowFilter")
      .attr('x', "-200%")
      .attr('y', "-200%")
      .attr('width', "500%")
      .attr('height', "500%")
    starGlow.append('feGaussianBlur')
      .attr('stdDeviation', "8")
      .attr('result', 'BLUR_OUT')
    var starGlowMerge = starGlow.append('feMerge')
    starGlowMerge.append('feMergeNode')
      .attr('in', 'BLUR_OUT')
    starGlowMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')

    var galaxyGradient = d3Node.append('radialGradient')
      .attr('id', 'galaxyBackgroundGradient')
      .attr('cx', "51.7999113%")
      .attr('cy', "13.0121779%")
      .attr('fx', "51.7999113%")
      .attr('fy', "13.0121779%")
      .attr('r', "86.9878221%")
    galaxyGradient.append('stop')
      .attr('stop-color', "#000000")
      .attr('stop-opacity', "0")
      .attr('offset', "0%")
    galaxyGradient.append('stop')
      .attr('stop-color', "#000000")
      .attr('stop-opacity', "0")
      .attr('offset', "48.4275351%")
    galaxyGradient.append('stop')
      .attr('stop-color', "#000000")
      .attr('offset', "100%")

    var galaxyShadow = d3Node.append('filter')
      .attr('id', "galaxyShadow")
      .attr('x', "-50%")
      .attr('y', "-50%")
      .attr('width', "200%")
      .attr('height', "200%")
      .attr('filterUnits', "objectBoundingBox")
    galaxyShadow.append('feOffset')
      .attr('dx', "0")
      .attr('dy', "2")
      .attr('in', "SourceAlpha")
      .attr('result', "shadowOffsetOuter1")
    galaxyShadow.append('feGaussianBlur')
      .attr('stdDeviation', "2")
      .attr('in', "shadowOffsetOuter1")
      .attr('result', "shadowBlurOuter1")
    galaxyShadow.append('feOffset')
      .attr('dx', "0")
      .attr('dy', "1")
      .attr('in', "SourceAlpha")
      .attr('result', "shadowOffsetInner1")
    galaxyShadow.append('feGaussianBlur')
      .attr('stdDeviation', "1.5")
      .attr('in', "shadowOffsetInner1")
      .attr('result', "shadowBlurInner1")
    var galaxyShadowMerge = galaxyShadow.append('feMerge')
    galaxyShadowMerge.append('feMergeNode')
      .attr('in', 'shadowBlurOuter1')
    galaxyShadowMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')
      galaxyShadowMerge.append('feMergeNode')
      .attr('in', 'shadowBlurInner1')

    var galaxyNoBackgroundCircle = d3Node.append('circle')
      .attr('id', 'galaxyNoBackgroudCircle')
      .attr('class', 'SongSystem--background__transparent')
      .attr('r', Constants.SYSTEM_BACKGROUND_RADIUS)

    var galaxyShadedBackgroundCircle = d3Node.append('circle')
      .attr('id', 'galaxyShadedBackgroudCircle')
      .attr('class', 'SongSystem--background__hovered')
      .attr('r', Constants.SYSTEM_BACKGROUND_RADIUS)
  }

}

module.exports = ViewFilters
