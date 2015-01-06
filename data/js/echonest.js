var Promise = require('promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var request = require('./request-cache');
var utils = require('./utils');
var queue = require('queue-async');
var sleep = require('sleep');
var mkdirp = require('mkdirp');


var LIMIT_WORKS = undefined;
var LIMIT_VERSIONS = undefined;
var WITH_ANALYSIS = false;

var INPUT_WORKS = 'data/out/songinfo-spotify.json';
var OUTPUT_FILE = 'data/out/songinfo-spotify-echonest.json';
var OUTPUT_4WHOSAMPLED_FILE = 'data/out/4whosampled.csv';
var ANALYSIS_OUT = 'data/out/analysis/';
var API_KEY = 'DY3KQCS3HF8JQBDV5';

mkdirp.sync(ANALYSIS_OUT);



function getLocation(locationText) {
  console.log(' - resolving geo location "'+ locationText +'"');
  return request(
    'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&components=types' +
    '&address='+encodeURI(locationText)
  );
}

function getTrackProfile(spotifyId, buckets) {
  if (!buckets) buckets = [];
  console.log(' - requesting track by spotify id "'+ spotifyId +'"');
  return request(
    'http://developer.echonest.com/api/v4/track/profile?api_key='+API_KEY+
        '&format=json&id=spotify:track:'+spotifyId+
        buckets.map(function(b) { return '&bucket='+b; }).join('')
  );
}

function getTrackAnalysis(url, spotifyId) {
  if (WITH_ANALYSIS) {
    console.log(' - requesting track analysis data');
    return new Promise(function(resolve, reject) {
      return request(url, 'track-analysis-data:'+spotifyId)
        .then(function(data) {
          resolve(data)
        })
        .catch(function(err) {
          if (err.statusCode === 404) {
            console.log('warning: 404 error for: ', url);
            resolve([]);
          } else {
            reject(err);
          }
        });
    });
  } else {
    return new Promise(function(resolve, reject) {
      resolve(null);
    });
  }
}

function getArtistProfile(spotifyId, buckets) {
  console.log(' - requesting artist by spotify id "'+ spotifyId +'"');
  return request(
    'http://developer.echonest.com/api/v4/artist/profile?api_key='+API_KEY+
        '&format=json&id=spotify:artist:'+spotifyId+
        buckets.map(function(b) { return '&bucket='+b; }).join('')
  );
}
function getSongProfile(songId, buckets) {
  console.log(' - requesting song by id "'+ songId +'"');
  return request(
    'http://developer.echonest.com/api/v4/song/profile?api_key='+API_KEY+
        '&format=json&id='+songId+
        buckets.map(function(b) { return '&bucket='+b; }).join('')
  );
}

function getMusicXmatchTrackId(artist, title) {
  return request(
    'http://developer.echonest.com/api/v4/song/search?api_key='+API_KEY+
    '&format=json&results=1&artist='+encodeURIComponent(artist)+
    '&title='+encodeURIComponent(title)+'&bucket=id:musixmatch-WW&limit=true&bucket=tracks'
  )
}

function getWhoSampledTrackId(artist, title) {
  return request(
    'http://developer.echonest.com/api/v4/song/search?api_key='+API_KEY+
    '&format=json&results=1&artist='+encodeURIComponent(artist)+
    '&title='+encodeURIComponent(title)+'&bucket=id:whosampled&limit=true&bucket=tracks'
  )
}


function extendWithEchonest(version, callback) {
  if (!version.spotify) {
    return callback(null, version);
  }
  getTrackProfile(version.spotify.id)
    .then(function(trackResponse) {
      var trackData = JSON.parse(trackResponse);
      var songId = utils.getIn(trackData, ['response','track','song_id']);

      if (!songId) {
        return callback(null, version);
      }

      getSongProfile(songId, ['audio_summary', 'artist_location', 'id:whosampled', 'song_type', 'artist_familiarity'])
        .then(function(songDataStr) {
          var songData = _.first(utils.getIn(JSON.parse(songDataStr), ['response', 'songs']));
          var audioSummary = songData.audio_summary,
              location = songData.artist_location;


          var echonest = { songId: songData.id };
          if (audioSummary) {
            _.extend(echonest, _.omit(audioSummary, 'analysis_url', 'key', 'audio_md5'));
          }
          if (location) {
            _.extend(echonest, location);
          }

          Promise.all([
            getWhoSampledTrackId(songData.artist_name, songData.title),
            getMusicXmatchTrackId(songData.artist_name, songData.title),
            getTrackAnalysis(audioSummary.analysis_url, version.spotify.id)
          ])
            .then(function(responseData) {
              var whosampledData = JSON.parse(responseData[0]);
              var musixmatchData = JSON.parse(responseData[1]);
              var analysisData = JSON.parse(responseData[2]);

              var songWS = _.first(utils.getIn(whosampledData, ['response', 'songs']));
              if (songWS) {
                var track = _.first(utils.getIn(songWS, ['tracks']));
                var matchesWS = utils.getIn(track, ['foreign_id']).match(/^whosampled:track:(\d*)/);
                if (matchesWS) {
                  var whosampledId = matchesWS[1];
                  _.extend(echonest, { whosampledId: whosampledId });
                }
              }

              var songMM = _.first(utils.getIn(musixmatchData, ['response', 'songs']));
              if (songMM) {
                var track = _.first(utils.getIn(songMM, ['tracks']));
                var matchesMM = utils.getIn(track, ['foreign_id']).match(/^musixmatch-WW:track:(\d*)/);
                if (matchesMM) {
                  var musixmatch = matchesMM[1];
                  _.extend(echonest, {musixmatch: musixmatch});
                }
              }

              if (analysisData) {
                //_.extend(echonest, { analysis: analysisData.segments });
                var fname = ANALYSIS_OUT + '/' + version.spotify.id + '.json';
                console.log('Writing to', fname);
                rw.writeFileSync(fname, JSON.stringify(analysisData), 'utf8')
              }

              _.extend(version, { echonest: echonest });
              callback(null, version);
            })
            .catch(callback);



          //if (location) {
          //  getLocation(location.location)
          //    .then(function(body) {
          //      var locationData = JSON.parse(body);
          //      var loc;
          //      if (locationData.results && locationData.results.length > 0) {
          //        var res = _.first(locationData.results);
          //        loc = {
          //          address: res.formatted_address,
          //          coords: res.geometry.location,
          //          location: location
          //        };
          //      } else {
          //        loc = {
          //          location: location
          //        };
          //      }
          //      _.extend(echonest, {artistLocation: loc});
          //      callback(null, _.extend(version, {echonest: echonest}));
          //    })
          //    .catch(callback);
          //
          //} else {
          //  callback(null, _.extend(version, {echonest: echonest}));
          //}
        })
        .catch(callback);

    })
    .catch(callback);


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
      if (err) {
        rejectWork(err);
      } else {
        resolveWork(work);
      }
    });


  });

});




function csv4Whosampled(data) {
  var csv = 'title,performer,date,whosampled-id,echonest-id,spotify-id\n';
  data.forEach(function(song) {
    song.versions.forEach(function(version) {
      if (version.echonest)
        csv += ['"'+version.title+'"',
                '"'+version.performer+'"',
                '"'+version.date+'"',
                version.echonest.whosampledId,
                version.echonest.songId,
                version.spotify.id].join(',')+'\n';
    });
  });
  return csv;
}




Promise
  .all(worksRequests)
  .then(function(data) {
    console.log('Writing to', OUTPUT_FILE);
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(data, undefined, 2), 'utf8')



    console.log('Writing to', OUTPUT_4WHOSAMPLED_FILE);
    rw.writeFileSync(OUTPUT_4WHOSAMPLED_FILE, csv4Whosampled(data), 'utf8')



  })
  .catch(function(err) {
     console.error('Error', err, err.stack);
   });



