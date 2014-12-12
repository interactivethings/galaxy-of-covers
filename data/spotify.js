var Promise = require('promise');
var RequestPromise = require('request-promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var md5 = require('crypto');
var mkdirp = require('mkdirp');
var fs = require('fs');


var INPUT_WORKS = 'data/json/test.json';
var OUTPUT_FILE = 'data/out/works-spotify.json';
var CACHE_PATH = 'data/cached';

mkdirp.sync(CACHE_PATH);

function md5sum(str) {
  return md5.createHash('md5').update(str).digest('hex');
}


function request(url) {
  var hash = md5sum(url);
  var fname = CACHE_PATH + '/' + hash;

  return new Promise(function(resolve, reject) {
    if (fs.existsSync(fname)) {
      console.log(' - cache hit for', hash);
      resolve(rw.readFileSync(fname, 'utf8'));
    } else {
      console.log(' - cache miss for', hash);
      RequestPromise(url).then(function(d) {
        rw.writeFileSync(fname, d, 'utf8');
        resolve(d);
      }, reject);
    }
  });
}




/**
 * If multiple tracks are found will return the most popular one.
 */
function getTrack(title, artist) {
  console.log(' - requesting track "'+ title +'" by "' + artist + '"');
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




var works = JSON.parse(rw.readFileSync(INPUT_WORKS, 'utf8'));



var worksRequests = works.map(function(work) {

  console.log('Processing work "' + work.title + '". Found ' + work.versions.length + ' versions');
  return new Promise(function (resolve, reject) {

    var versions = _.take(work.versions, 5);

    var versionsRequests = versions.map(function(version) {
      return getTrack(version.title, version.performer)
        .then(function(d) {
          version.spotify = d.notFound ? null : d;
          return version;
        });
    });

    Promise.all(versionsRequests)
      .then(function(versions) {
        resolve(versions);
      })
      .catch(function(err) {
        console.log('Error', err);
        reject(err);
      });


  });

});




Promise
  .all(worksRequests)
  .then(function(data) {
    console.log('Writing to', OUTPUT_FILE);
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(data, undefined, 2), 'utf8')
  });















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
