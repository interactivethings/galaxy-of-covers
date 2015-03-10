var svgutil = require('util/svgutil');

function DetailShapes(selection) {
  var detailClips = selection.selectAll('.SongTimeline--clip')
    .data((d) => [d])

  detailClips.enter().append('clipPath')
    .attr('class', 'SongTimeline--clip')

  detailClips.exit().remove()

  detailClips
    .attr('id', (d) => 'tlplanetclip-' + d.versionId)

  var detailClipUse = detailClips.selectAll('use')
    .data((d) => [d])

  detailClipUse.enter().append('use')

  detailClipUse.exit().remove()

  detailClipUse
    .attr('xlink:href', (d) => '#' + 'tlplanet-' + d.versionId)

  var roundDetailShapes = selection.filter((d) => d.isCircle)
    .selectAll('.SongTimeline--planet__shape.SongTimeline--planet__round')
    .data((d) => [d])

  roundDetailShapes.enter().append('circle')
    .attr('class', 'SongTimeline--planet__shape SongTimeline--planet__round')

  roundDetailShapes.exit().remove()

  roundDetailShapes
    .attr('id', (d) => 'tlplanet-' + d.versionId)
    .attr('r', (d) => d.timelinePlanetRadius)
    .attr('fill', (d) => d.genreColor)

  var pointyDetailShapes = selection.filter((d) => !d.isCircle)
    .selectAll('.SongTimeline--planet__shape.SongTimeline--planet__pointy')
    .data((d) => [d])

  pointyDetailShapes.enter().append('polygon')
    .attr('class', 'SongTimeline--planet__shape SongTimeline--planet__pointy')

  pointyDetailShapes.exit().remove()

  pointyDetailShapes
    .attr('id', (d) => 'tlplanet-' + d.versionId)
    .attr('points', (d) => svgutil.joinPolygonPoints(d.polygonPoints))
    .attr('fill', (d) => d.genreColor)

  var detailShadows = selection.selectAll('.SongTimeline--planet__shadow')
    .data((d) => [d])

  detailShadows.enter().append('rect')
    .attr('class', 'SongTimeline--planet__shadow')

  detailShadows.exit().remove()

  detailShadows
    .attr('transform', (d) => 'rotate(' + d.timelineRotation + ')' )
    .attr('y', (d) => -d.timelinePlanetRadius)
    .attr('width', (d) => 2 * d.timelinePlanetRadius)
    .attr('height', (d) => 2 * d.timelinePlanetRadius)

  detailShadows
    .attr('clip-path', (d) => 'url(#' + 'tlplanetclip-' + d.versionId + ')')
}

module.exports = DetailShapes;
