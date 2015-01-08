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
  }

}

module.exports = DataUtil
