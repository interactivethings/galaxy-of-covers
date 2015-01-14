var path = require('path'),
    webpack = require('webpack'),
    bourbon = require('node-bourbon');

var BUILD = process.env.NODE_ENV === 'production';

var moduleDirectories = [
    'node_modules',
    'bower_components',
    'node_modules/catalyst/src',
    'src'
  ];

var sassDirectories = moduleDirectories.map(resolvePath).concat(bourbon.includePaths);

// Define free variables. Useful for having development builds with debug logging or adding global constants.
var definePlugin = new webpack.DefinePlugin({
  __DEV__: !BUILD,
  'process.env': Object.keys(process.env).reduce(function(o, k) {
     o[k] = JSON.stringify(process.env[k]);
     return o;
   }, {})
});

var providePlugin = new webpack.ProvidePlugin({
  reqwest: "reqwest"
});

module.exports = {
  entry: {
    main: resolvePath('src/main')
  },
  output: {
    path: resolvePath('build'),
    filename: '[name].js',
    pathinfo: BUILD ? false : true
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, loader: 'jsx?harmony'},
      {test: /\.json?$/, loader: 'json'},
      {test: /\.scss$/, loader: 'style!css!sass?' + querySerializeArray(sassDirectories, 'includePaths[]=')},
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.html$/, loader: 'file?name=[name].[ext]'},
//      {test: /\.svg/, loader: 'raw'},
      {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}, // inline base64 URLs for <=8k images, direct URLs for the rest
      // Enable for CoffeeScript support
      // { test: /\.coffee$/, loader: 'coffee' },
      // { test: /\.cjsx$/, loader: 'coffee!cjsx' },
      // For icon fonts
      {test: /\.eot|\.woff|\.ttf|\.svg$/, loader: 'file-loader'}
    ],
    postLoaders: [
      // Enable for jshint support
      // {test: /\.jsx?$/, loader: 'jshint-loader', exclude: /node_modules/}
    ],
    noParse: [
      /\.min\.js$/
    ]
  },
  resolve: {
    alias: {
      'd3': 'd3/d3',
      'TweenMax': 'gsap/src/minified/TweenMax.min'
    },
    modulesDirectories: moduleDirectories,
    extensions: ['', '.js', '.jsx', '.json', '.css', '.scss', '.coffee', '.cjsx']
  },
  plugins: [
    definePlugin
  ]
};

function resolvePath(p) {
  return path.resolve(__dirname, p);
}

function querySerializeArray(arr, sep) {
  return sep + arr.join('&' + sep);
}
