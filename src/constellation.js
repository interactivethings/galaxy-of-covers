var songData
  , mainSong

window.preload = function() {
  songData = loadJSON("../data/out/songinfo-spotify.json")
};

window.setup = function() {
  createCanvas(800, 800)

  mainSong = songData.filter(function(d) {
    return !!d.title.toLowerCase().match(/along the watchtower/g)
  })[0]

  
}

window.draw = function() {

}
