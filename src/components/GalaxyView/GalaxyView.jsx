var React = require('react')

require('components/GalaxyView/GalaxyView.scss')

var Constants = require('Constants')
,   SvgUtil = require('util/svgutil')
,   SongSystem = require('components/SongSystem/SongSystem')

var GalaxyView = React.createClass({

  numRows(numSystems) {
    var n = 2 * Math.ceil(numSystems / 3)
    if (numSystems % 3 !== 0) n--
    return n
  },

  getGalaxyGroupDimensions(systemRadius, numSystems) {
    var width = window.innerWidth
    ,   height = 2 * systemRadius + this.numRows(numSystems) * (width / 4 * Math.tan(Math.PI / 3))
    return {width, height}
  },

  makeHexGrid(length, maxCols) {
    var grid = []
    ,   column = 0
    ,   r = 0
    ,   shortRowBit = 0 // start with a long row
    for (var i = 0; i < length; ++i) {
      grid.push({
        q: column - ((r / 2) | 0) // (x | 0) is a simple Math.floor
      , r: r
      })

      column++
      if (!shortRowBit) {
        if (column == maxCols) {
          column = 0
          r++
          shortRowBit = 1
        }
      } else {
        if (column == maxCols - 1) {
          column = 0
          r++
          shortRowBit = 0
        }
      }
    }
    return grid
  },

  render() {
    // render the "galaxy" view
    var hoveredId = this.props.dynamicState.get('hoveredSystemId')
    ,   genreFilter = this.props.dynamicState.get('filteredGenres')
    ,   scales = this.props.scales

    var viewportWidth = window.innerWidth
    ,   systemRadius = Constants.SYSTEM_WIDTH
    ,   rootThree = Math.sqrt(3)
    ,   hexRadius = ((systemRadius / rootThree) * 2) + Constants.SYSTEM_PADDING
    ,   hexWidth = hexRadius / 2 * rootThree * 2
    ,   numSystemsWidest = Math.floor(viewportWidth / hexWidth)
    ,   leftOffset = ((((viewportWidth / hexWidth) % 1) / 2) * hexWidth) + (hexWidth / 2)
    ,   topOffset = this.props.layout.headerHeight + hexRadius
    ,   hexGrid = this.makeHexGrid(this.props.songs.length, numSystemsWidest)
    ,   songSystems = this.props.songs.map(function(songData, i) {
          var hex = hexGrid[i]
          ,   r = hex.r
          ,   q = hex.q
          ,   sx = leftOffset + hexRadius * rootThree * (q + r / 2)
          ,   sy = topOffset + hexRadius * 3 / 2 * r

          var systemId = songData.id
          ,   shouldAnimate = systemId !== hoveredId

          return (
            <SongSystem
              id={systemId}
              animate={shouldAnimate}
              isHovered={!shouldAnimate}
              x={sx}
              y={sy}
              r={systemRadius}
              songData={songData}
              scales={scales}
              key={songData.title}
              genreFilter={genreFilter}
            />
          )
        })

    var galaxyHeight = this.props.songs.length ? topOffset + hexGrid[hexGrid.length - 1].r * (hexRadius * 2 * 3 / 4) + hexRadius : 0

    return (
      <svg className="SongGalaxy" width={viewportWidth} height={galaxyHeight} >
        <defs>
          <g dangerouslySetInnerHTML={{ __html: SvgUtil.getStarGlow() }} />
          <g dangerouslySetInnerHTML={{ __html: SvgUtil.getGalaxyGradient() }} />
          <g dangerouslySetInnerHTML={{ __html: SvgUtil.getGalaxyShadow() }} />
        </defs>
        {songSystems}
      </svg>
    )
  }

})

module.exports = GalaxyView
