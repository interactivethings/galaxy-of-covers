var Promise = require('promise');
var _ = require('underscore');
var d3 = require('d3');
var rw = require('rw');
var request = require('./request-cache');
var cheerio = require('cheerio');

var BASE_URL = 'http://www.whosampled.com';
var COVERS_PER_PAGE = 15;


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





function getWork(url) {
  return new Promise(function(resolveWork, rejectWork) {
    request(BASE_URL + url)
      .then(function (body) {
        var $ = cheerio.load(body);
        var covers = getCovers($, 0);

        var pageRequests = $('.pagination .page a').toArray().map(function(pageNode, page) {
          var pageUrl = $(pageNode).attr('href');
          console.log('Loading page '+pageUrl);
          return request(BASE_URL + pageUrl).then(function(pageBody) {
            return getCovers(cheerio.load(pageBody), page + 1);
          });
        });

        Promise
          .all(pageRequests)
          .then(function(data) {
            resolveWork(covers.concat(_.flatten(data)));
          })
          .catch(rejectWork);

      })
      .catch(rejectWork);
  });

}


Promise.all([
  getWork('/Bob-Dylan/All-Along-the-Watchtower/covered/'),
  getWork('/The-Leaves/Hey-Joe/covered/')
])
  .then(function(data) {
    console.log(data);
  })
  .catch(function(err) {
    console.log('Error', err, err.stack);
    rejectWork(err);
  });

