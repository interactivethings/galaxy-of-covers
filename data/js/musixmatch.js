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

var INPUT_WORKS = 'data/out/songinfo-spotify-echonest.json';
var OUTPUT_FILE = 'data/out/songinfo-spotify-echonest-genres.json';
var MUSIXMATCH_API_KEY = '006c63e4c22b778031d66627031533c9';




function getTrackProfile(mmId) {
  console.log(' - requesting track by musiXmatch id "'+ mmId +'"');
  return request(
    'http://api.musixmatch.com/ws/1.1/track.get?apikey='+MUSIXMATCH_API_KEY+
        '&track_id='+mmId
  );
}


function extendWithMusiXmatch(version, callback) {
  var mmId = utils.getIn(version, ['echonest','musixmatch']);
  if (!mmId) {
    version.musiXmatch = null;
    return callback(null, version);
  }
  getTrackProfile(mmId)
    .then(function(trackResponse) {
      var trackData = JSON.parse(trackResponse);
      var genres = utils
        .getIn(trackData, ['message','body','track','primary_genres', 'music_genre_list'])
        .map(function(d) { return utils.getIn(d, ['music_genre', 'music_genre_name']); });

      version.musiXmatch = {
        id: mmId,
        genres: genres
      };
      return callback(null, version);
    }).catch(callback);
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

    var q = queue(1);   // run serially
    versions.forEach(function(version) {
      q.defer(extendWithMusiXmatch, version);
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



Promise
  .all(worksRequests)
  .then(function(data) {
    console.log('Writing to', OUTPUT_FILE);
    genreStats(data);
    spotifyStats(data);
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(data, undefined, 2), 'utf8')
  })
  .catch(function(err) {
     console.error('Error', err, err.stack);
   });


function genreStats(data) {
  var genreStats = {};
  data.forEach(function(song) {
    song.versions.forEach(function(version) {
      var numGenres = utils.getIn(version, ['musiXmatch','genres','length']) || 0;
      if (genreStats[numGenres])
        genreStats[numGenres]++;
      else
        genreStats[numGenres] = 1;
    });

  });
  console.log(genreStats);
}

function spotifyStats(data) {
  var total = 0, spotify = 0, echonest = 0, musixmatch = 0;
  var spotifyPop = 0, musixmatchPop = 0;
  data.forEach(function(song) {
    song.versions.forEach(function(version) {
      total++;
      if (version.spotify) {
        spotify++;
        spotifyPop += version.spotify.popularity;
      }
      if (version.echonest) echonest++;
      if (version.musiXmatch) {
        musixmatch++;
        musixmatchPop += version.spotify.popularity;
      }
    });
  });
  console.log("Total:",total,
    " spotify:",spotify,
    " echonest:",echonest,
    " musixmatch:",musixmatch
  );
  console.log("avg spotifyPop="+(spotifyPop/spotify), "avg musixmatchPop="+(musixmatchPop/musixmatch));
}