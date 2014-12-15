var songData
  , mainSong
  , mainSongCovers
  , dRange
  , gRange
  , gScale

window.preload = function() {
  songData = loadJSON("../data/out/whosampled.json")
};

window.setup = function() {
  createCanvas(windowWidth, windowHeight)

  /*mainSong = songData.filter(function(d) {
    console.log(d);
    return !!d.title.toLowerCase().match(/along the watchtower/g)
  })[0]*/

  mainSongCovers = songData[0];
  mainSongCovers.forEach(function(d) {
    d.date = new Date(+d.year, 0);
  })
  mainSongCovers.sort(function(a, b) {
    return a.date.getTime() - b.date.getTime()
  })

  dRange = mainSongCovers.reduce(function(m, v) {
    m[0] = Math.min(m[0], v.date.getTime())
    m[1] = Math.max(m[1], v.date.getTime())
    return m
  }, [Infinity, -Infinity])

  gRange = mainSongCovers.reduce(function(m, v) {
    var g = v.genre
    if (!~m.indexOf(g)) m.push(g)
    return m
  }, [])

//  gRange.sort()

  gScale = {}
  var interval = TWO_PI / gRange.length;
  for (var i = 0, a = 0, l = gRange.length; i < l; i++, a += interval) {
    gScale[gRange[i]] = a
  }
}

window.draw = function() {
  background(16)

  translate(width / 2, height / 2)

  fill(255)
//  strokeWeight(0)
  strokeWeight(2.5)
  stroke(255)

  drawStar(mainSongCovers, 0)
}

function drawStar(list, index) {
  var size = lerp(10, 30, +list[index].rank / list.length)
  ellipse(0, 0, size, size)
  if (!list[index + 1]) return true;
  var nextDatum = list[index + 1]
  var nextPos = plotNextStar(nextDatum.genre, nextDatum.date.getTime())
  line(0, 0, nextPos.x, nextPos.y)
  translate(nextPos.x, nextPos.y)
  drawStar(list, index + 1)
}

function polarToEuclid(t, r) {
  return createVector(cos(t) * r, sin(t) * r)
}

function plotNextStar(genre, date) {
  var t = gScale[genre]
  var r = map(date, dRange[0], dRange[1], 0, 200)
  return polarToEuclid(t, r)
}
