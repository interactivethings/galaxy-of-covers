var songData;

window.preload = function() {
  songData = loadJSON("../data/out/songinfo-spotify.json")
};

window.setup = function() {
  console.log(songData);
  createCanvas(800, 800)
}

window.draw = function() {

}
