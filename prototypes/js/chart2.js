(function() {

var state = {
  data: [],
  currentData: [],
  dimension1: "NUM_VERSIONS",
  dimension2: "AVG_POPULARITY",
  selected: []
}

var sortOrder = d3.ascending

var titleAcc = sszvis.fn.prop('title');


var dimOptions = [
  {
    title: "NUM_VERSIONS",
    data: function(d) { return d.versions.length; }
  }, {
    title: "AVG_POPULARITY",
    data: function(d) { return avg(d.versions, inGetter("spotify.popularity")); }
  }, {
    title: "AVG_SPOTIFY_DURATION",
    data: function(d) { return avg(d.versions, inGetter("spotify.duration")); }
  }, {
    title: "AVG_ECHONEST_DURATION",
    data: function(d) { return avg(d.versions, inGetter("echonest.duration")); }
  }
]

; [ "danceability"
  , "energy"
  , "liveness"
  , "tempo"
  , "speechiness"
  , "acousticness"
  , "instrumentalness"
  , "mode"
  , "time_signature"
  , "loudness"
  , "valence"
  , "latitude"
  , "longitude"
  ].forEach(function(prop) {
    dimOptions.push({
      title: "AVG_" + prop.toUpperCase(),
      data: function(d) { return avg(d.versions, inGetter("echonest" + "." + prop)); }
    })
  })

var optionIndex = dimOptions.reduce(function(m, o) {
  m[o.title] = o
  return m
}, {})

var actions = {
  initState: function(data) {
    state.data = data

    var tempTitles = data.map(titleAcc)

    state.colors = d3.range(tempTitles.length).map(function(i) {
      return d3.hsl(((i / tempTitles.length) * 360 + 10) % 360, 0.85, 0.5).toString();
    })

    state.colorScale = d3.scale.ordinal()
      .domain(tempTitles)
      .range(state.colors);

    actions.calcCurrentData()
  },

  changeDim1: function(dim) {
    state.dimension1 = dim

    actions.calcCurrentData()
  },

  changeDim2: function(dim) {
    state.dimension2 = dim

    actions.calcCurrentData()
  },

  calcCurrentData: function() {
    var dim1 = optionIndex[state.dimension1]
      , dim2 = optionIndex[state.dimension2]

    var currentData = state.data.map(function(d) {
      return {
        title: titleAcc(d),
        value1: dim1.data(d),
        value2: dim2.data(d)
      }
    })

    state.filteredCurData = sszvis.fn.derivedSet(currentData, function(d) {
      return d.value1 + '__' + d.value2;
    })

    state.d1Domain = d3.extent(state.filteredCurData, function(d) { return d.value1 })
    state.d2Domain = d3.extent(state.filteredCurData, function(d) { return d.value2 })

    render(state)
  },

  select: function(d) {
    state.selected = [d]
    render(state)
  },

  deselect: function(d) {
    state.selected = []
    render(state)
  }

};

d3.json('../data/out/songinfo-spotify-echonest.json')
  .get(function(err, data) {
    if (err) {
      console.log(err)
    } else {
      actions.initState(data)
    }
  })

var selects = d3.selectAll('.chart2-changeDim')
  .on('change', function(d, i) {
    var v = $(this).val()
    switch (i) {
      case 0:
        actions.changeDim1(v)
        break
      case 1:
        actions.changeDim2(v)
        break
    }
  })

var dimOptEls = selects.selectAll('option')
  .data(dimOptions)

dimOptEls.enter()
  .append('option')
  .attr('value', titleAcc)
  .attr('label', titleAcc)

function render(state) {
  var bounds = sszvis.bounds({ width: 1000, height: 900, top: 10, bottom: 10, left: 30, right: 10 })

  var xScale = d3.scale.linear()
    .domain(state.d1Domain)
    .range([0, bounds.innerWidth])

  var yScale = d3.scale.linear()
    .domain(state.d2Domain)
    .range([bounds.innerHeight, 0])

  var dotGen = sszvis.component.dot()
    .x(function(d) {
      return xScale(d.value1)
    })
    .y(function(d) {
      return yScale(d.value2)
    })
    .radius(4)
    .fill(function(d) {
      return state.colorScale(d.title)
    })

  var selects = d3.selectAll('.chart2-changeDim')

  selects.each(function(selectDatum, i) {
    d3.select(this).selectAll('option')
      .attr('selected', function(d) {
        switch (i) {
          case 0:
            return titleAcc(d) === state.dimension1 ? true : null;
          case 1:
            return titleAcc(d) === state.dimension2 ? true: null;
        }
      });
  })

  var tooltipLayer = sszvis.createHtmlLayer('#chart2')
    .datum(state.selected)

  var tooltip = sszvis.annotation.tooltip()
    .renderInto(tooltipLayer)
    .body(function(d) {
      return [
              ['song title: ', d.title],
              ['x-value (' + state.dimension1 + '): ', d.value1],
              ['y-value (' + state.dimension2 + '): ', d.value2]
             ]
    })
    .visible(function(d) {
      return state.selected.indexOf(d) >= 0
    })
    .orientation(function(d) {
      return d.x <= 100 ? 'left' : d.x >= bounds.innerWidth - 100 ? 'right' : 'bottom';
    })

  var chartLayer = sszvis.createSvgLayer('#chart2', bounds, {})
    .datum(state.filteredCurData)

  var dotGroup = chartLayer.selectGroup('dotgroup')
    .call(dotGen)

  dotGroup.selectAll('[data-tooltip-anchor]')
    .call(tooltip)

  if (state.dimension1 !== state.dimension2) {
    var mouseOverlay = sszvis.behavior.voronoi()
      .x(function(d) { return xScale(d.value1) })
      .y(function(d) { return yScale(d.value2) })
      .bounds([[-bounds.padding.left, -bounds.padding.top], [bounds.innerWidth + bounds.padding.right, bounds.innerHeight]])
      .on('over', actions.select)
      .on('out', actions.deselect)

    chartLayer.selectGroup('voronoiMouse')
      .datum(state.filteredCurData)
      .call(mouseOverlay)
  }

}

})()
