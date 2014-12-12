var Promise = require('promise');
var RequestPromise = require('request-promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var md5 = require('crypto');
var mkdirp = require('mkdirp');
var fs = require('fs');
var sleep = require('sleep');


var LIMIT_WORKS = undefined;
var LIMIT_VERSIONS = undefined;
var REQUEST_DELAY = 100;
var INPUT_WORKS = 'data/out/songinfo.json';
var OUTPUT_FILE = 'data/out/songinfo-spotify.json';
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
      sleep.usleep(REQUEST_DELAY * 1000);
      RequestPromise(url)
        .then(function(d) {
          rw.writeFileSync(fname, d, 'utf8');
          resolve(d);
        })
        .catch(function(err) {
          console.log('Received '+err.statusCode+ ' for request "' + url + '".');
          reject(err);
        });
    }
  });
}


/**
* Has genres in the result.
*/
function getArtist(name) {
  return new Promise(function (resolve, reject) {
    request('https://api.spotify.com/v1/search?q='+name+'&type=artist')
      .then(
        function (body) {
          var data = JSON.parse(body);
          var artist = _.first(data.artists.items);
          if (!artist) {
            return reject('No artist found by name "' + name + '"');
          }

          resolve({
            genres: artist.genres,
            name: artist.name,
            image: _.max(artist.images, function(d) { return d.width; }).url
          });
        },
        function(err) { return reject(err); }
      );
  });
}



/**
 * If multiple tracks are found will return the most popular one.
 */
function getTrack(title, artist) {
  console.log(' - requesting track "'+ title +'" by "' + artist + '"');
  return new Promise(function (resolve, reject) {
    request('https://api.spotify.com/v1/search?q=' + encodeURIComponent(title) +
                 ' artist:' + encodeURIComponent(artist) + '&type=track')
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
if (LIMIT_WORKS) {
  works = _.take(works, LIMIT_WORKS);
}



var worksRequests = works.map(function(work) {

  console.log('Processing work "' + work.title + '". Found ' + work.versions.length + ' versions');
  return new Promise(function (resolveWork, rejectWork) {

    var versions = work.versions;
    if (LIMIT_VERSIONS) {
      versions = _.take(versions, LIMIT_VERSIONS);
    }

    var versionsRequests = versions.map(function(version) {
      return new Promise(function(resolveVersion, reject) {
        getTrack(version.title, version.performer)
          .then(function(d) {
            version.spotify = d.notFound ? null : d;
            resolveVersion(version);
          })
          .catch(function(err) {
            reject(err);
          });
      });
    });

    Promise.all(versionsRequests)
      .then(function(versions) {
        resolveWork(work);
      })
      .catch(function(err) {
        console.log('Error', ""+err);
        rejectWork(err);
      });


  });

});




Promise
  .all(worksRequests)
  .then(function(data) {

    console.log('Total works:', data.length);
    data.forEach(function(d) {
      var counts = _.countBy(d.versions, function(d) { return d.spotify ? true : false; });
      console.log('Spotified '+ counts.true + ' of ' + d.versions.length +' versions of "'+ d.title + '"');
    });

    console.log('Writing to', OUTPUT_FILE);
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(data, undefined, 2), 'utf8')
  });

