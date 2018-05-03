var resolveHere = require("path").resolve.bind(null, __dirname);
var assignDeep = require("assign-deep");
var values = require("object-values");
var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var packageJson = require("./package.json");

var env = process.env.NODE_ENV || "development";

var loaders = {
  common: {
    js: { test: /\.js$/, include: [resolveHere("src")], loader: "babel" },
    css: { test: /\.css$/, loader: "style!css?modules!postcss" },

    // Images
    png: { test: /\.png$/, loader: "url?limit=8192&mimetype=image/png" },
    gif: { test: /\.gif$/, loader: "url?limit=8192&mimetype=image/gif" },
    jpg: { test: /\.jpe?g$/, loader: "file" },
    svg: { test: /\.svg$/, loader: "url?limit=8192&mimetype=image/svg+xml" },

    // Fonts
    woff2: {
      test: /\.woff2$/,
      loader: "url?limit=8192&mimetype=application/font-woff2"
    },
    woff: {
      test: /\.woff$/,
      loader: "url?limit=8192&mimetype=application/font-woff"
    },
    ttf: { test: /\.ttf$/, loader: "file" },
    eot: { test: /\.eot$/, loader: "file" },

    // Other
    json: { test: /\.json$/, loader: "json" },
    html: { test: /\.html$/, loader: "file?name=[name].[ext]" }
  },

  development: {
    css: {
      // loader: 'style!css?modules&localIdentName=[name]-[local]-[hash:base64:5]!postcss' // For hashed names. DON'T USE, because many CSS classes are included in JS as plain text
      loader: "style!css?modules&localIdentName=[local]!postcss"
    }
  },

  production: {
    css: {
      // loader: ExtractTextPlugin.extract('style', 'css?modules&localIdentName=[name]-[local]-[hash:base64:5]!postcss')
      loader: ExtractTextPlugin.extract(
        "style",
        "css?modules&localIdentName=[local]!postcss"
      )
    }
  }
};

var webpackConfig = {
  common: {
    output: {
      publicPath: "",

      path: resolveHere("build"),
      filename: "[name].[hash].js"
    },
    resolve: {
      root: resolveHere("src")
    },
    module: {
      loaders: values(assignDeep(loaders.common, loaders[env])),
      noParse: [/\.min\.js$/]
    },
    postcss: [
      require("postcss-nested")(),
      require("postcss-custom-media")({
        extensions: {
          "--narrow-view": "(max-width: 850px)"
        }
      }),
      require("postcss-clearfix")(),
      require("autoprefixer")({ browsers: ["last 2 versions"] })
    ]
  },

  development: {
    entry: {
      app: [
        "webpack-hot-middleware/client?noInfo=true&reload=true",
        resolveHere("src/index")
      ]
    },
    output: {
      pathinfo: true
    },
    publicPath: "/",
    devtool: "#eval-source-map",
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(true),
        "process.env.NODE_ENV": JSON.stringify("development")
      }),
      new HtmlWebpackPlugin({
        title: packageJson.name,
        template: "src/index.html",
        favicon: "src/assets/ixt_favicon-32.png",
        inject: "body",
        description: packageJson.description,
        version: packageJson.version
      })
    ]
  },

  production: {
    entry: {
      app: resolveHere("src/index")
    },
    publicPath: "https://lab.interactivethings.com/galaxy-of-covers/",
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(false),
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
      new HtmlWebpackPlugin({
        title: packageJson.name,
        template: "src/index.html",
        favicon: "src/assets/ixt_favicon-32.png",
        inject: "body",
        description: packageJson.description,
        version: packageJson.version
      }),
      new ExtractTextPlugin("style.[contenthash].css", { allChunks: true }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  }
};

module.exports = assignDeep(webpackConfig.common, webpackConfig[env]);
