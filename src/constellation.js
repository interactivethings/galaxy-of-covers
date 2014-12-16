var allSongs
  , mainSong
  , mainSongCovers
  , dRange
  , gRange
  , gScale
  , sXScale
  , sYScale
  , xSpace
  , ySpace

window.preload = function() {
  allSongs = loadJSON("../data/out/whosampled.json")
};

function processData(songData) {
  songData.forEach(function(d) {
    d.date = new Date(+d.year, 0);
  })
  songData.sort(function(a, b) {
    return a.date.getTime() - b.date.getTime()
  })
  return songData
}

function identity(_) { return _ }

function unique(arr, fn) {
  fn || (fn = identity)
  var seen = {}
    , result = []
    , val
  for (var i = 0, l = arr.length; i < l; ++i) {
    val = fn(arr[i], i)
    if (!seen[val]) {
      seen[val] = true
      result.push(val)
    }
  }
  return result
}

function flatten(arr) {
  return [].concat.apply([], arr)
}

function range(start, stop, step) {
  var arr = []
  for ( ; start < stop; start += step) {
    arr.push(start)
  }
  return arr
}

function max(arr) {
  var i = -1, n = arr.length, m, t
  while (++i < n) if ((t = array[i]) != null && t > m) m = t;
  return m
}

window.setup = function() {
  createCanvas(windowWidth, windowHeight)

  allSongs = allSongs.map(processData)

  mainSongCovers = allSongs[0];

  dRange = mainSongCovers.reduce(function(m, v) {
    m[0] = Math.min(m[0], v.date.getTime())
    m[1] = Math.max(m[1], v.date.getTime())
    return m
  }, [Infinity, -Infinity])

  gRange = unique(flatten(allSongs.map(function(_) {
    return unique(_, function(v) { return v.genre })
  })))

  gScale = {}
  var interval = TWO_PI / gRange.length;
  for (var i = 0, a = 0, l = gRange.length; i < l; i++, a += interval) {
    gScale[gRange[i]] = a
  }

  xSpace = width / allSongs.length
  ySpace = height / allSongs.length

  starGap = xSpace / (max(allSongs.map(function(arr) {
    return arr.length
  })) / 5)

  sXScale = range(0, width, xSpace)
  sYScale = range(0, height, ySpace)
}

window.draw = function() {
  background(16)

  fill(255, 255, 255, 200)
  stroke(255, 255, 255, 255)
  strokeWeight(1.5)

  allSongs.forEach(function(covers, i) {
    push()
    translate(sXScale[i], sYScale[i])
    translate(xSpace / 2, ySpace / 2)
    drawStar(covers, 0)
    pop()
  })
}

function drawStar(list, index) {
  var size = starSize(+list[index].rank / list.length)
  ellipse(0, 0, size, size)
  if (!list[index + 1]) return true;
  var nextDatum = list[index + 1]
  var nextPos = nextStarPoint(nextDatum.genre, nextDatum.date.getTime())
  line(0, 0, nextPos.x, nextPos.y)
  translate(nextPos.x, nextPos.y)
  drawStar(list, index + 1)
}

function starSize(t) {
  return lerp(2, 20, t)
}

function polarToEuclid(t, r) {
  return createVector(cos(t) * r, sin(t) * r)
}

function nextStarPoint(genre, date) {
  var t = gScale[genre]
  var r = map(date, dRange[0], dRange[1], 4, starGap)
  return polarToEuclid(t, r)
}
