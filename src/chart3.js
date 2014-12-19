(function() {

var state = {
  data: [],
  currentData: [],
  dimension1: "DANCEABILITY",
  dimension2: "POPULARITY",
  song: '',
  selected: []
}

var sortOrder = d3.ascending

var titleAcc = sszvis.fn.prop('title');

var dimOptions = [
  {
    title: "POPULARITY",
    data: inGetter("spotify.popularity")
  }, {
    title: "SPOTIFY_DURATION",
    data: inGetter("spotify.duration")
  }, {
    title: "ECHONEST_DURATION",
    data: inGetter("echonest.duration")
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
      title: prop.toUpperCase(),
      data: inGetter('echonest' + '.' + prop)
    })
  })

var optionIndex = dimOptions.reduce(function(m, o) {
  m[o.title] = o
  return m
}, {})

var actions = {
  initState: function(data) {
    state.data = data

    state.songList = [""].concat(data.map(titleAcc))

    state.dataIndex = data.reduce(function(m, v) {
      m[v.title] = v
      return m
    }, {})

    var tempTitles = [].concat.apply([], data.map(function(d) {
      return d.versions.map(titleAcc)
    }))

    tempTitles = sszvis.fn.set(tempTitles)

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

  changeSong: function(song) {
    state.song = song

    actions.calcCurrentData()
  },

  calcCurrentData: function() {
    var songData = state.dataIndex[state.song] || []
    var versionData = songData.versions || []
    var dim1 = optionIndex[state.dimension1]
      , dim2 = optionIndex[state.dimension2]

    var currentData = versionData.map(function(d) {
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

var selects = d3.selectAll('.chart3-changeDim')
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

var songSelect = d3.selectAll('#changeSong')
  .on('change', function(d, i) {
    var v = $(this).val()
    actions.changeSong(v)
  })

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

  var selects = d3.selectAll('.chart3-changeDim')

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

  var options = songSelect.selectAll('option')
    .data(state.songList)

  options.enter()
    .append('option')
    .attr('value', sszvis.fn.identity)
    .attr('label', sszvis.fn.identity)

  var tooltipLayer = sszvis.createHtmlLayer('#chart3')
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

  var chartLayer = sszvis.createSvgLayer('#chart3', bounds, {})
    .datum(state.filteredCurData)

  var dotGroup = chartLayer.selectGroup('dotgroup')
    .call(dotGen)

  dotGroup.selectAll('[data-tooltip-anchor]')
    .call(tooltip)

  if (state.dimension1 !== state.dimension2) { // for some reason, when the points are all in a line, the voronoi calculation causes an infinite loop
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
