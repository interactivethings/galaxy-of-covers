var Promise = require('promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var request = require('./request-cache');
var cheerio = require('cheerio');
var queue = require('queue-async');
var csv = require('csv');
var resolver = require('resolver');
var sleep = require('sleep');

var BASE_URL = 'http://www.whosampled.com';
var COVERS_PER_PAGE = 15;
var INPUT_FILE = 'data/out/songinfo-spotify-echonest.json';
var OUTPUT_FILE = 'data/out/whosampled.json';

function getYear(text) {
  if (!text) return null;
  var m = text.match(/\((\d{4})\)/);
  return m ? m[1] : null;
}

function getCoverId(href) {
  if (!href) return null;
  var m = href.match(/\/cover\/(\d+)\//);
  return m ? m[1] : null;
}

function getCovers($, page) {
  return $('.innerContent .list .listEntry .trackDetails').toArray().map(function(node, i) {
    return {
      title: $('.trackName', node).text(),
      id: getCoverId($('.trackName').attr('href')),
      artist: $('.trackArtist a', node).toArray().map(function(d) { return $(d).text(); }).join(', '),
      year: getYear($(node).text()),
      rank: i + 1 + page * COVERS_PER_PAGE,
      genre: $('.trackBadge .topItem', node).text()
    };
  });
}

function sleepResolveURL(url, callback) {
  // tail call laziness... ;)
  sleep.usleep(700 * 1000); // don't hit a rate limit
  resolver.resolve(url, callback);
}

function getWhoSampledCovers(whosampledSongId) {
  return new Promise(function(resolvePromise, rejectPromise) {
    var viewUrl = BASE_URL + '/track/view/' + whosampledSongId;
    sleepResolveURL(viewUrl, function(error, resolvedUrl, filename, contentType) {
      if (error) {
        rejectPromise(error);
      } else {
        var pageUrl = resolvedUrl + 'covered/';
        request(pageUrl)
          .then(function(pageBody) {
            resolvePromise(null, pageBody);
          }, function(err) {
            console.log('got a 404 on '+pageUrl);
            // if you get a 404, don't worry about it. Just move on
            resolvePromise(err);
          })
      }
    });
  });
}

function extendWithWhoSampled(version, callback) {
  if (!(version.echonest && version.echonest.whosampledId)) {
    console.log('no echonest id');
    return callback(null, version);
  }
  getWhoSampledCovers(version.echonest.whosampledId)
    .then(function (err, body) {
      if (err) callback(null, null);
      var $ = cheerio.load(body);
      var covers = getCovers($, 0);

      var pageRequests = $('.pagination .page a').toArray().map(function(pageNode, page) {
        var pageUrl = $(pageNode).attr('href');
        return request(BASE_URL + pageUrl).then(function(pageBody) {
          return getCovers(cheerio.load(pageBody), page + 1);
        });
      });

      Promise
        .all(pageRequests)
        .then(function(data) {
          callback(null, covers.concat(_.flatten(data)));
        }, callback);
    }, callback);
}

// I couldn't get the above stuff to work, so it's not used
// (but kept here in case it can be made to work)
// Instead, I wrote a script to read a list of pre-resolved urls
// that script starts here

var works = JSON.parse(rw.readFileSync(INPUT_FILE, 'utf8'));

var oUrls = [];

works.forEach(function(work) {
  work.versions.forEach(function(version) {
    if (version.echonest && version.echonest.whosampledId) {
      oUrls.push(BASE_URL + '/track/view/' + version.echonest.whosampledId)
    }
  })
})

function shiftAndResolve(list1, list2, callback) {
  var u = list1.shift();
  console.log('checking, ', u);
  resolver.resolve(u, function(err, url) {
    if (!err) list2.push(url)
  })

  if (!list1.length) {
    console.log(list2);
    callback(list2);
    return true;
  } else {
    setTimeout(function() {
      shiftAndResolve(list1, list2, callback)
    }, 500);
  }
}

function makeRequest(url, callback) {
  request(url)
    .then(function(body) {
      var $ = cheerio.load(body);
      var covers = [];
      try {
        covers.concat(getCovers($, 0));
      } catch (e) {}

      var pages = [];

      var pageRequests = $('.pagination .page a').toArray().map(function(pageNode, page) {
        var pageUrl = $(pageNode).attr('href');
        return request(BASE_URL + pageUrl)
          .then(function(pageBody) {
            try {
              pages.push(getCovers(cheerio.load(pageBody), page + 1));
            } catch (e) {
              return [];
            }
          });
      });

      Promise
        .all(pageRequests)
        .then(function(data) {
          callback(null, covers.concat(_.flatten(pages)))
        }, function(err) {
          callback(null, covers.concat(_.flatten(pages)))
        });
    }, function(err) {
      callback(null, [])
    });
}

var rUrls = JSON.parse(rw.readFileSync('data/out/whosampled-resolved.json', 'utf8'));

var q = queue(1)
rUrls.forEach(function(url) {
  var coversUrl = url + 'covered';
  q.defer(makeRequest, coversUrl);
})
q.awaitAll(function(error, samplesData) {
  if (error) {
    console.log("error: ", error);
  } else {
    rw.writeFileSync(OUTPUT_FILE, JSON.stringify(samplesData, undefined, 2), 'utf8');
  }
})

