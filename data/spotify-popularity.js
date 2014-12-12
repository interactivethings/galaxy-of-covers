var request = require('request-promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var Promise = require('promise');

var SONG_LIST = 'data/out/songs.csv';
var OUTPUT_FILE = 'data/out/popularity.json';


function loadSongList() {
  return d3.csv.parse(rw.readFileSync(SONG_LIST, 'utf8'),
    function(d) {
      return {
        title: d['TITLE (original)'],
        originalArtist: d['ORIGINAL'],
        coverArtist: d['COVER BAND']
      };
    });
}


/**
 * If multiple tracks are found will return the most popular one.
 */
function getTrack(title, artist) {
  return new Promise(function (resolve, reject) {
    request('https://api.spotify.com/v1/search?q=' + title + ' artist:' + artist + '&type=track')
      .then(
        function (body) {
          var data = JSON.parse(body);

          var track = _.max(data.tracks.items, function(d) { return d.popularity; });
          if (!track || !track.artists) {
            console.warn('No track found by name "'+title+'", artist "'+artist+'"');
            return resolve({ notFound: true });
          }

          resolve({
            id: track.id,
            name: track.name,
            artists: track.artists.map(function(d) { return d.name; }),
            duration: track.duration_ms,
            popularity: track.popularity,
            preview: track.preview_url,
            albumArtwork: _.max(track.album.images, function(d) { return d.width; }).url
          });
        },
        function(err) { return reject(err); }
      );
  });

}


/**
 * Has genres in the result.
 */
//function getArtist(name) {
//  return new Promise(function (resolve, reject) {
//    request('https://api.spotify.com/v1/search?q='+name+'&type=artist')
//      .then(
//        function (body) {
//          var data = JSON.parse(body);
//          var artist = _.first(data.artists.items);
//          if (!artist) {
//            return reject('No artist found by name "' + name + '"');
//          }
//
//          resolve({
//            genres: artist.genres,
//            name: artist.name,
//            image: _.max(artist.images, function(d) { return d.width; }).url
//          });
//        },
//        function(err) { return reject(err); }
//      );
//  });
//}





var requests = [];

loadSongList().forEach(function(song) {
  requests.push(
    getTrack(song.title, song.originalArtist)
      .then(function(d) {
        return d;
      }));

  requests.push(
    getTrack(song.title, song.coverArtist)
      .then(function(d) {
        d.original = false;
        return d;
      }));

});


Promise
  .all(requests)
  .then(function(data) {
    var foundData = data.filter(function(d) { return !d.notFound; });
    console.log('Writing to', OUTPUT_FILE);
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(foundData, undefined, 2), 'utf8')
  });


