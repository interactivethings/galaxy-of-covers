/*eslint-disable*/

var path = require('path');
var express = require('express');
var webpack = require('webpack');
var devMiddleware = require('webpack-dev-middleware');
var hotMiddleware = require('webpack-hot-middleware');
var historyApiFallback = require('connect-history-api-fallback');
var portfinder = require('portfinder');
var clc = require('cli-color');
var webpackConfig = require('../webpack.config');

var banner = `
       ___           ___           ___           ___           ___ 
      /\\  \\         /\\  \\         /\\  \\         /\\  \\         /\\  \\ 
     /::\\  \\        \\:\\  \\       /::\\  \\       /::\\  \\        \\:\\  \\ 
    /:/\\ \\  \\        \\:\\  \\     /:/\\:\\  \\     /:/\\:\\  \\        \\:\\  \\ 
   _\\:\\~\\ \\  \\       /::\\  \\   /::\\~\\:\\  \\   /::\\~\\:\\  \\       /::\\  \\ 
  /\\ \\:\\ \\ \\__\\     /:/\\:\\__\\ /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\     /:/\\:\\__\\ 
  \\:\\ \\:\\ \\/__/    /:/  \\/__/ \\/__\\:\\/:/  / \\/_|::\\/:/  /    /:/  \\/__/ 
   \\:\\ \\:\\__\\     /:/  /           \\::/  /     |:|::/  /    /:/  / 
    \\:\\/:/  /     \\/__/            /:/  /      |:|\\/__/     \\/__/ 
     \\::/  /                      /:/  /       |:|  | 
      \\/__/                       \\/__/         \\|__| 
       ___           ___           ___                       ___ 
      /\\  \\         /\\  \\         /\\__\\          ___        /\\  \\ 
     /::\\  \\       /::\\  \\       /:/  /         /\\  \\       \\:\\  \\ 
    /:/\\:\\  \\     /:/\\:\\  \\     /:/__/          \\:\\  \\       \\:\\  \\ 
   /::\\~\\:\\  \\   /::\\~\\:\\  \\   /::\\__\\____      /::\\__\\      /::\\  \\ 
  /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\ /:/\\:::::\\__\\  __/:/\\/__/     /:/\\:\\__\\ 
  \\:\\~\\:\\ \\/__/ \\/_|::\\/:/  / \\/_|:|~~|~    /\\/:/  /       /:/  \\/__/ 
   \\:\\ \\:\\__\\      |:|::/  /     |:|  |     \\::/__/       /:/  / 
    \\:\\ \\/__/      |:|\\/__/      |:|  |      \\:\\__\\       \\/__/ 
     \\:\\__\\        |:|  |        |:|  |       \\/__/ 
      \\/__/         \\|__|         \\|__|

`;

function server(options, config) {
  var app = express();
  var compiler = webpack(config);

  app.use(historyApiFallback());
  
  app.use(devMiddleware(compiler, {
      publicPath: config.output.publicPath,
      contentBase: config.output.contentBase,
      stats: {
        assets: true,
        chunkModules: false,
        chunkOrigins: false,
        chunks: false,
        colors: true,
        hash: false,
        timings: true,
        version: false
      }
    }));

  app.use(hotMiddleware(compiler, {log: false}));

  app.listen(options.port, options.host, function (err, result) {
    if (err) { throw err };
    console.log(clc.erase.screen);
    console.log(clc.red(banner));
    console.log(clc.red('> > > >  Galaxy of Covers dev server running at ' + clc.underline('http://' + options.host + ':' + options.port) + '  < < < <') + '\n');
  });
};

portfinder.getPort({port: 8080, host: '0.0.0.0'}, function(err, port) {
  if (err) { throw err; }
  server({port: port, host: '0.0.0.0'}, webpackConfig);
});


