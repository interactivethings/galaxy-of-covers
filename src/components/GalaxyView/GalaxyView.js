import d3 from 'd3';

import css from 'components/GalaxyView/GalaxyView.css';

import Constants from 'Constants';
import svgutil from 'util/svgutil';
import ViewActions from 'actions/ViewActions';
import AnimationUtil from 'util/AnimationUtil';

var ROOT_THREE = Math.sqrt(3);

var GalaxyView = {

  constructColumnLayout(shortRad, numGalaxies, width) {
    let mid = width / 2;
    let systemRad = shortRad - Constants.SYSTEM_PADDING;

    return {
      positions: d3.range(numGalaxies).map((i) => {
        return {
          x: mid,
          y: (2 * i + 1) * systemRad
        };
      }),
      width: width,
      height: 2 * systemRad * numGalaxies
    };
  },

  constructGridLayout(shortRad, numGalaxies, width, numColumns) {
    let longRad = shortRad * 2 / ROOT_THREE;
    let midPoint = width / 2;

    var grid = []
    ,   column = 0
    ,   row = 0
    ,   shortRowBit = 0 // start with a long row

    let longLeft = -(numColumns - 1);
    let shortLeft = -(numColumns - 2);

    for (var i = 0; i < numGalaxies; ++i) {
      let dx = shortRowBit ? shortLeft + 2 * column : longLeft + 2 * column;
      grid.push({
        x: midPoint + dx * shortRad,
        y: (1 + (3 / 2) * row) * longRad
      });

      column++;
      if (shortRowBit) {
        if (column === numColumns - 1) {
          column = 0;
          row++;
          shortRowBit = 0;
        }
      } else {
        if (column === numColumns) {
          column = 0;
          row++;
          shortRowBit = 1;
        }
      }
    }

    let numRows = row - (column === 0 ? 1 : 0);

    return {
      positions: grid,
      width: width,
      height: (2 + (3 / 2) * numRows) * longRad
    };
  },

  applyHexLayout(data) {
    let width = window.innerWidth;

    if (data.length === 0) {
      return {
        layoutWidth: width,
        layoutHeight: window.innerHeight
      };
    }

    let hexShortRad = Constants.SYSTEM_RADIUS + Constants.SYSTEM_PADDING;
    let numHexColumns = Math.floor(width / (2 * hexShortRad));

    let layout;
    if (numHexColumns < 2) {
      layout = this.constructColumnLayout(hexShortRad, data.length, width, numHexColumns);
    } else {
      layout = this.constructGridLayout(hexShortRad, data.length, width, numHexColumns);
    }

    data.forEach((songData, i) => {
      let {x, y} = layout.positions[i];
      songData.galaxyX = x;
      songData.galaxyY = y;
      songData.versions.forEach((v) => {
        v.galaxyX = x;
        v.galaxyY = y;
      });
    });

    return {
      layoutWidth: layout.width,
      layoutHeight: layout.height
    };
  },

  isActive(node) {
    return d3.select(node).classed('MainView__galaxy')
  },

  render(node, data, state, dimensions) {
    var d3Node = d3.select(node)

    d3Node
      .classed('MainView__galaxy', true)
      .attr('width', dimensions.layoutWidth)
      .attr('height', dimensions.layoutHeight)

    d3Node.datum(dimensions)

    data = data.filter((d) => d.isInViewport)

    var viewWrapper = d3Node.selectAll('.ViewWrapper')

    if (viewWrapper.empty()) {
      viewWrapper = d3Node.append('g')
        .attr('class', 'ViewWrapper')
    }

    viewWrapper.attr('transform', 'translate(0,0)')

    var systems = viewWrapper.selectAll('.SongSystem')
      .data(data, (d) => d.songId)

    if (state.get('hoveredSystemId')) {
      systems.attr('opacity', (d) => d.systemIsHovered ? 1 : 0.8)
    } else {
      systems.attr('opacity', 0.8)
    }

    var enterSystems = systems.enter()
      .append('g')
      .attr('class', 'SongSystem')
      .attr('opacity', 0.8)

    systems.exit()
      .attr('opacity', 0)
      .remove()

    systems
      .on('mouseenter', (d) => {
        ViewActions.hoverOnSongSystem(d.songId)
      })
      .on('mouseleave', (d) => {
        ViewActions.hoverOffSongSystem()
      })
      .on('click', (d) => {
        ViewActions.clickOnSongSystem(d.songId)
      })

    // background and star
    var backgrounds = systems.selectAll('.SongSystem--background')
      .data((d) => [d])

    backgrounds.enter()
      .append('use')
      .attr('class', 'SongSystem--background')
      .attr('xlink:href', '#galaxyNoBackgroudCircle')

    backgrounds.exit().remove()

    backgrounds
      .attr('transform', (d) => svgutil.getTranslateAndRotate(d.galaxyX, d.galaxyY, -20))

    var stars = systems.selectAll('.SongSystem--glowingstar')
      .data((d) => [d])

    stars.enter()
      .append('circle')
      .attr('class', 'SongSystem--glowingstar')
      .attr('r', 5)

    stars.exit().remove()

    stars
      .attr('transform', (d) => svgutil.translateString(d.galaxyX, d.galaxyY))

    var orbits = systems.selectAll('.SongSystem--orbit')
      .data((d) => d.versionsFilteredIn, (d) => d.versionId)

    orbits.enter()
      .append('ellipse')
      .attr('class', 'SongSystem--orbit')

    orbits.exit().remove()

    orbits
      .attr('rx', (d) => d.orbitRadiusX)
      .attr('ry', (d) => d.orbitRadiusY)
      .attr('transform', (d) => svgutil.getTranslateAndRotate(d.galaxyX, d.galaxyY, d.orbitRotationOffset))

    var roundPlanets = systems.selectAll('.SongSystem--planet.SongSystem--planet__round')
      .data((d) => d.versionsFilteredIn.filter((datum) => datum.isCircle), (d) => d.versionId)

    roundPlanets.exit().remove()

    roundPlanets.enter()
      .append('circle')
      .attr('class', 'SongSystem--planet SongSystem--planet__round')
      .on('mouseover', function(d) { ViewActions.onGalaxySongOver(this, d); })
      .on('mouseout', function() { ViewActions.onGalaxySongOut(); });

    roundPlanets
      .attr('r', (d) => d.galaxyPlanetRadius)
      .attr('fill', (d) => d.genreColor)

    var pointyPlanets = systems.selectAll('.SongSystem--planet.SongSystem--planet__pointy')
      .data((d) => d.versionsFilteredIn.filter((datum) => !datum.isCircle), (d) => d.versionId)

    pointyPlanets.exit().remove()

    pointyPlanets.enter()
      .append('polygon')
      .attr('class', 'SongSystem--planet SongSystem--planet__pointy')
      .on('mouseover', function(d) { ViewActions.onGalaxySongOver(this, d); })
      .on('mouseout', function() { ViewActions.onGalaxySongOut(); });

    pointyPlanets
      .attr('points', (d) => svgutil.getPolygonPoints(0, 0, d.galaxyPlanetRadius, d.numSides))
      .attr('fill', (d) => d.genreColor)

    var songDetailData = state.get('hoveredGalaxySong') ? [state.get('hoveredGalaxySong')] : [];
    var songDetailNode = state.get('hoveredGalaxySongNode');

    var songDetailLabel = systems.selectAll('.' + css.SystemDetailText)
      .data(songDetailData);

    songDetailLabel.exit().remove();

    songDetailLabel.enter()
      .append('g')
      .attr('class', css.SystemDetailText);

    songDetailLabel
      .attr('transform', (d) => {
        let {x, y} = svgutil.parseTranslate(songDetailNode.getAttribute('transform'));
        return svgutil.translateString(x, y - 40);
      });

    var songDetailTitle = songDetailLabel.selectAll('.' + css.SystemDetailTitle)
      .data((d) => [d]);

    songDetailTitle.enter()
      .append('text')
      .attr('class', css.SystemDetailTitle)

    songDetailTitle
      .text((d) => d.versionTitle);

    var songDetailArtist = songDetailLabel.selectAll('.' + css.SystemDetailArtist)
      .data((d) => [d]);

    songDetailArtist.enter()
      .append('text')
      .attr('class', css.SystemDetailArtist);

    songDetailArtist
      .text((d) => d.versionPerformer)
      .attr('dy', 20);

    // song label is above the rest of the system
    var labels = systems.selectAll('.SongSystem--songtitle')
      .data((d) => [d])

    labels.exit().remove()

    labels.enter()
      .append('text')
      .attr('class', 'SongSystem--songtitle')
      .attr('dy', -20)

    labels
      .text((d) => d.title)
      .attr('transform', (d) => svgutil.translateString(d.galaxyX, d.galaxyY))
  }

}

module.exports = GalaxyView
