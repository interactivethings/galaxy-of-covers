var songNum = 0
var versionNum = 0

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
    return number+'%'
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
  }

}

module.exports = DataUtil
