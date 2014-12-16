var Promise = require('promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var request = require('./request-cache');
var utils = require('./utils');
var queue = require('queue-async');
var sleep = require('sleep');


var LIMIT_WORKS = undefined;
var LIMIT_VERSIONS = undefined;
var INPUT_WORKS = 'data/out/songinfo-spotify.json';
var OUTPUT_FILE = 'data/out/songinfo-spotify-echonest.json';
var API_KEY = 'DY3KQCS3HF8JQBDV5';



function getLocation(locationText) {
  console.log(' - resolving geo location "'+ locationText +'"');
  return request(
    'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&components=types' +
    '&address='+encodeURI(locationText)
  );
}

function getTrackProfile(spotifyId, bucket) {
  console.log(' - requesting track by spotify id "'+ spotifyId +'"');
  return request(
    'http://developer.echonest.com/api/v4/track/profile?api_key='+API_KEY+
        '&format=json&id=spotify:track:'+spotifyId+'&bucket='+bucket
  );
}

function getArtistProfile(spotifyId, bucket) {
  console.log(' - requesting artist by spotify id "'+ spotifyId +'"');
  return request(
    'http://developer.echonest.com/api/v4/artist/profile?api_key='+API_KEY+
        '&format=json&id=spotify:artist:'+spotifyId+'&bucket='+bucket
  );
}


function extendWithEchonest(version, callback) {
  if (!version.spotify) {
    return callback(null, version);
  }
  Promise.all([
    getTrackProfile(version.spotify.id, 'audio_summary'),
    getArtistProfile(version.spotify.artists[0].id, 'artist_location')
  ])
    .then(function(data) {
      var audioSummary = utils.getIn(JSON.parse(data[0]), ['response','track']),
          location = utils.getIn(JSON.parse(data[1]), ['response','artist','artist_location']);

      var echonest = {};
      if (audioSummary) {
        echonest = _.extend(
          {id: audioSummary.song_id },
          audioSummary.audio_summary
        );
        delete echonest['analysis_url'];
      }
      if (location) {
        getLocation(location.location)
          .then(function(body) {
            var locationData = JSON.parse(body);
            var loc;
            if (locationData.results && locationData.results.length > 0) {
              var res = _.first(locationData.results);
              loc = {
                address: res.formatted_address,
                coords: res.geometry.location,
                location: location
              };
            } else {
              loc = {
                location: location
              };
            }
            echonest = _.extend(echonest, {artistLocation: loc});
            callback(null, _.extend(version, {echonest: echonest}));
          })
          .catch(function(err) {
            callback(err);
          });

      } else {
        callback(null, _.extend(version, {echonest: echonest}));
      }
    })
    .catch(function(err) {
      callback(err);
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

    //var versionsRequests = versions.map(function(version) {
    //  return new Promise(function(resolveVersion, reject) {
    //    if (!version.spotify) {
    //      resolveVersion(version);
    //    }
    //    getTrack(version.spotify.id)
    //      .then(function(d) {
    //        var track = utils.getIn(JSON.parse(d), ['response','track']);
    //        if (track) {
    //          version.echonest = _.extend({id: track.song_id}, track.audio_summary);
    //          delete version.echonest['analysis_url'];
    //        }
    //        resolveVersion(version);
    //      })
    //      .catch(function(err) {
    //        reject(err);
    //      });
    //  });
    //});
    //
    //Promise.all(versionsRequests)
    //  .then(function(versions) {
    //    resolveWork(work);
    //  })
    //  .catch(function(err) {
    //    console.log('Error', ""+err);
    //    rejectWork(err);
    //  });


    var q = queue(1);   // run serially
    versions.forEach(function(version) {
      q.defer(extendWithEchonest, version);
    });
    q.awaitAll(function(err, results) {
      if (err) rejectWork(err); else resolveWork(results);
    });


  });

});



Promise
  .all(worksRequests)
  .then(function(data) {
    console.log('Writing to', OUTPUT_FILE);
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(data, undefined, 2), 'utf8')
  })
  .catch(function(err) {
     console.log('Error', err, err.stack);
   });



