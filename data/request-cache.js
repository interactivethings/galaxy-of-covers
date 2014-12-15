var Promise = require('promise');
var RequestPromise = require('request-promise');
var mkdirp = require('mkdirp');
var fs = require('fs');
var sleep = require('sleep');
var md5 = require('crypto');
var rw = require('rw');

var CACHE_PATH = 'data/cached';
var REQUEST_DELAY = 200;

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
          var status;
          switch (err.statusCode) {
            case 429: status = '"Too many requests"'; break;
            default: status = err.statusCode;
          }

          console.log('Received HTTP status '+status+ ' for request "' + url + '".');
          reject(err);
        });
    }
  });
}


module.exports = request;
