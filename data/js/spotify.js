var Promise = require('promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var request = require('./request-cache');


var LIMIT_WORKS = undefined;
var LIMIT_VERSIONS = undefined;
var INPUT_WORKS = 'data/out/songinfo.json';
var OUTPUT_FILE = 'data/out/songinfo-spotify.json';



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
            artists: track.artists.map(function(d) { return { id: d.id, name: d.name }; }),
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

    var existingIds = {};
    data.forEach(function(d) {
      var counts = _.countBy(d.versions, function(d) { return d.spotify ? true : false; });
      var maxPop = d3.max(d.versions, function(d) { return d.spotify ? d.spotify.popularity : 0; });
      console.log('Spotified '+ counts.true + ' of ' + d.versions.length +' versions of "'+ d.title + '" ' +
                  '(popMax='+maxPop+')');
      // this reduce operation filters out versions which returned the same spotify id as an already - existing version
      d.versions = d.versions.reduce(function(vMemo, trackDatum) {
        if (trackDatum.spotify && trackDatum.spotify.id) {
          var id = trackDatum.spotify.id;
          if (!existingIds[id]) {
            existingIds[id] = trackDatum;
            vMemo.push(trackDatum);
          } else {
            console.log("Warning: two versions with the same spotify id. Keeping the version dated:", existingIds[id].date, "instead of the one dated:", trackDatum.date);
          }
        } else {
          vMemo.push(trackDatum);
        }
        return vMemo;
      }, []);
    });

    console.log('Writing to', OUTPUT_FILE);
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(data, undefined, 2), 'utf8')
  });

