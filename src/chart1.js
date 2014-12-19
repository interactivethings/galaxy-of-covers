(function() {
  var state = {
    data: [],
    titles: [],
    currentData: [],
    selected: [],
    currentVis: "NUM_VERSIONS",
    currentSort: "TITLE"
  };

  var sortOrder = d3.ascending;

  var actions = {
    initState: function(data) {
      state.data = data;

      var tempTitles = data.map(getTitle); // initial title order

      state.colors = d3.range(tempTitles.length).map(function(i) {
        return d3.hsl(((i / tempTitles.length) * 360 + 10) % 360, 0.85, 0.5).toString();
      })

      state.colorScale = d3.scale.ordinal()
        .domain(tempTitles)
        .range(state.colors);

      actions.calcCurrentData();
    },

    changeVis: function(vis) {
      state.currentVis = vis;

      actions.calcCurrentData(state);
    },

    changeSort: function(sort) {
      state.currentSort = sort;

      actions.calcCurrentData(state);
    },

    calcCurrentData: function() {
      var activeVis = optionIndex[state.currentVis];
      var activeSort = optionIndex[state.currentSort];
      state.currentData = state.data.map(function(d) {
        return {
          title: getTitle(d),
          value: activeVis.data(d),
          sortValue: activeSort.data(d)
        };
      });

      state.currentData.sort(function(a, b) {
        return sortOrder(a.sortValue, b.sortValue);
      })

      state.titles = state.currentData.map(getTitle); // encapsulates the sort order in a list of titles

      state.dataRange = d3.extent(state.currentData, function(d) { return d.value; });

      render(state);
    },

    select: function(d) {
      state.selected = [d]
      render(state)
    },

    deselect: function(d) {
      state.selected = []
      render(state)
    }
  }

  var getTitle = sszvis.fn.prop('title');

  var visOptions = [
    {
      title: "TITLE",
      data: function(d) { return d.title; }
    }, {
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
  ];

  [ "danceability"
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
    visOptions.push({
      title: "AVG_" + prop.toUpperCase(),
      data: function(d) { return avg(d.versions, inGetter("echonest" + "." + prop)); }
    });
  });

  var optionIndex = visOptions.reduce(function(m, v) {
    m[getTitle(v)] = v;
    return m;
  }, {});

  d3.json('../data/out/songinfo-spotify-echonest.json')
    .get(function(err, data) {
      if (err) {
        console.log(err);
      } else {
        actions.initState(data);
      }
    });

  function avg(arr, fn) {
    var len = arr.length;
    var sum = arr.reduce(function(m, v) {
      var val = fn(v)
      if (val != null) m += val;
      else len--;
      return m;
    }, 0);
    return roundPrecision(sum / len, 3);
  }

  function getIn(o, keys) {
    var k = keys[0],
        ks = keys.slice(1);
    if (!o || !o.hasOwnProperty(k)) return null;
    return ks.length ? getIn(o[k], ks) : o[k];
  }

  function inGetter(stringOfKeys) {
    var keys = stringOfKeys.split('.');
    return function(o) {
      return getIn(o, keys);
    };
  }

  function roundPrecision(n, p) {
    var pow10 = Math.pow(10, p)
    return Math.round(n * pow10) / pow10;
  }

  function render(state) {
    var bounds = sszvis.bounds({ top: 100, bottom: 10, left: 30, right: 10, width: 1000, height: 900 })

    var chartLayer = sszvis.createSvgLayer('#chart1', bounds, {})
      .datum(state.currentData);

    var htmlLayer = sszvis.createHtmlLayer('#chart1');

    var selectContainer = htmlLayer.selectDiv('selectelement');

    var labels = selectContainer
      .selectAll('label')
      .data([0, 1])

    var enteredLabels = labels.enter()
      .append('label')
      .text(function(d, i) {
        switch (d) {
          case 0: return "size value:";
          case 1: return "sort value:";
        }
      })

    var selects = enteredLabels
      .append('select');

    var optionEls = selects.selectAll('option')
      .data(visOptions);

    optionEls.enter()
      .append('option')
      .attr('value', getTitle)
      .attr('label', getTitle)

    selects.each(function(selectDatum, i) {
      d3.select(this).selectAll('option')
        .attr('selected', function(d) {
          switch (selectDatum) {
            case 0:
              return getTitle(d) === state.currentVis ? true : null;
            case 1:
              return getTitle(d) === state.currentSort ? true: null;
          }
        });
    })

    selects.on('change', function(d, i) {
      var v = $(this).val()
      switch (d) {
        case 0:
          actions.changeVis(v); break
        case 1:
          actions.changeSort(v); break
      }
    });

    var tooltips = htmlLayer.selectDiv('tooltipelement')
      .datum(state.selected);

    var xScale = d3.scale.ordinal()
      .domain(state.titles)
      .rangeBands([0, bounds.innerWidth], 0.08);

    var hScale = d3.scale.linear()
      .domain([Math.min(0, state.dataRange[0]), state.dataRange[1]])
      .range([0, bounds.innerHeight])

    var barsGen = sszvis.component.bar()
      .x(function(d) {
        return xScale(d.title);
      })
      .y(function(d) {
        return bounds.innerHeight - hScale(d.value);
      })
      .width(xScale.rangeBand())
      .height(function(d) {
        return hScale(d.value)
      })
      .fill(function(d) {
        return state.colorScale(d.title);
      });

    var barGroup = chartLayer.selectGroup('bargroup')
      .call(barsGen)

    var tooltip = sszvis.annotation.tooltip()
      .renderInto(tooltips)
      .body(function(d) {
        return [
                ['song title: ', d.title],
                ['size value (' + state.currentVis + '): ', d.value],
                ['sort value (' + state.currentSort + '): ', d.sortValue]
               ]
      })
      .visible(function(d) {
        return state.selected.indexOf(d) >= 0;
      })
      .orientation(function(d) {
        return d.x <= 100 ? 'left' : d.x >= bounds.innerWidth - 100 ? 'right' : 'bottom';
      })

    barGroup.selectAll('.sszvis-bar')
      .on('mouseover', actions.select)
      .on('mouseout', actions.deselect)

    barGroup.selectAll('[data-tooltip-anchor]')
      .call(tooltip)
  }

})()
