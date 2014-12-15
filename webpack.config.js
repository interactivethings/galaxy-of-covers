var path = require('path'),
    webpack = require('webpack'),
    bourbon = require('node-bourbon');

var BUILD = process.env.NODE_ENV === 'production';

var moduleDirectories = [
    'node_modules',
    'bower_components',
    'src'
  ];

var sassDirectories = moduleDirectories.map(resolvePath).concat(bourbon.includePaths);

// Define free variables. Useful for having development builds with debug logging or adding global constants.
var definePlugin = new webpack.DefinePlugin({
  __DEV__: !BUILD
});

var providePlugin = new webpack.ProvidePlugin({
  reqwest: "reqwest"
});

module.exports = {
  entry: {
    constellation: resolvePath('src/constellation.js')
  },
  output: {
    path: resolvePath('build'),
    filename: '[name].js',
    pathinfo: BUILD ? false : true
  },
  module: {
    loaders: [
      { test: /\.scss$/, loader: 'style!css!sass?' + querySerializeArray(sassDirectories, 'includePaths[]=')},
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.html$/, loader: 'file?name=[name].[ext]' }
    ],
    noParse: [
      /\.min\.js$/
    ]
  },
  resolve: {
    alias: {
      'p5': 'p5/lib/p5'
    },
    modulesDirectories: moduleDirectories,
    extensions: ['', '.js', '.json', '.css', '.scss']
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
