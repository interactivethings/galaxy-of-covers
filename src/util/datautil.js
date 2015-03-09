'use strict';

var d3 = require('d3')

var Constants = require('Constants')

var songNum = 0
var versionNum = 0

var monthDayYear = d3.time.format('%B %e, %Y')
,   monthYear = d3.time.format('%B %Y')
,   year = d3.time.format('%Y')

function parseDate(dateString) {
  return monthDayYear.parse(dateString) || monthYear.parse(dateString) || year.parse(dateString)
}

function baseBounds() {
  return [Infinity, -Infinity]
}

function adjustBounds(bounds, value) {
  bounds[0] = Math.min(bounds[0], value);
  bounds[1] = Math.max(bounds[1], value);
}

var DataUtil = {

  baseBounds() {
    return [Infinity, -Infinity]
  },

  getMinMax(series, accessor) {
    var minMax = this.baseBounds()
    series.forEach(function(item) {
      var value = accessor(item)
      minMax[0] = Math.min(minMax[0], value);
      minMax[1] = Math.max(minMax[1], value);
    })
    return minMax
  },

  songSystemId(songData) {
    return 'song-' + (++songNum)
  },

  versionId(versionData) {
    return 'version-' + (++versionNum)
  },

  formatPercent(number) {
    return Math.floor(+number.toFixed(2) * 100)+'%'
  },

  extend(obj) {
    Array.prototype.slice.call(arguments, 1).forEach((source) => {
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          obj[prop] = source[prop]
        }
      }
    })
    return obj
  },

  // from underscore
  throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  },

  before(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  },

  parseDate: parseDate,

  makeScaleSet(bounds) {
    var orbitRadius = d3.time.scale().domain([new Date(1929, 1, 1), new Date()]).range([4, Constants.SYSTEM_RADIUS])
    ,   planetRadius = d3.scale.linear().domain([0, 100]).range([3, 18])
    ,   planetColor = d3.scale.ordinal().domain(bounds.genres).range(['#FE839F', '#E493CB', '#B0ABE9', '#67BFEC', '#0ACED4', '#37D5A9', '#7ED679', '#BDD053', '#F8C24B', '#FB826F'])
    // rotation ranges from 270 to 450 degrees
    ,   rotation = d3.scale.linear().domain([0, 1]).range([0, -90])
    ,   timelineRotation = d3.scale.linear().domain([0, 1]).range([0, -90])
    // rotation ranges from 0 to 360 degrees
  //  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, 360])
    ,   speed = d3.scale.linear().domain(bounds.energyRange).range([0.5 / 600, 2.5 / 600]) // time-based animation speed
//    ,   speed = d3.scale.linear().domain(bounds.energyRange).range([0.5 / 8, 2.5 / 8]) // frame-based animation speed
    ,   timelinePlanetRadius = d3.scale.linear().domain([0, 100]).range([3, 50])
    ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([-1, 8, 7, 6, 5, 4, 3]) // reverse scale
//    ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([9])
    ,   blinkScale = d3.scale.linear().domain(bounds.tempoRange).range([2 / 600, 14 / 600]) // time-based animation speed
//    ,   blinkScale = d3.scale.linear().domain(bounds.tempoRange).range([2 / 8, 14 / 8]) // frame-based animation speed

    return {
      getOrbitRadiusScale: () => orbitRadius,
      getRadiusScale: () => planetRadius,
      getColorScale: () => planetColor,
      getRotationScale: () => rotation,
      getSpeedScale: () => speed,
      getTimelineRadiusScale: () => timelinePlanetRadius,
      getEdgesScale: () => edgesScale,
      getTimelineRotation: () => timelineRotation,
      getBlinkScale: () => blinkScale
    }
  },

  findBounds(dataset) {
    var energy = baseBounds()
    ,   speechiness = baseBounds()
    ,   tempo = baseBounds()

    dataset.forEach((songData) => {
      songData.versions.forEach((versionData) => {
        if (versionData.echonest) {
          adjustBounds(energy, versionData.echonest.energy)
          adjustBounds(speechiness, versionData.echonest.speechiness)
          adjustBounds(tempo, versionData.echonest.tempo)
        }
      })
    })

    return {
      energyRange: energy,
      speechinessRange: speechiness,
      tempoRange: tempo,
      genres: ["Rock / Pop", "Soul / Funk / Disco", "Jazz / Blues", "Country / Folk", "Instrumental", "Classical", "Electronic / Dance", "Reggae", "Hip-Hop / R&B", "Other"]
    }
  }

}

module.exports = DataUtil
