const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { ufs } = require('unionfs');
const { createFsFromVolume, Volume } = require('memfs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackEntrypointsPlugin = require('..');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (fixture) => {
  const fixtureDir = path.join(__dirname, 'fixtures', fixture);
  const fixtureConfig = JSON.parse(
    fs.readFileSync(path.join(fixtureDir, 'fixture.json'))
  );
  const compiler = webpack({
    mode: 'development',
    context: fixtureDir,
    entry: fixtureConfig.multipleEntrypoints
      ? {
          one: './one.js',
          two: './two.js',
          three: './three.js',
        }
      : {
          one: './one.js',
        },
    output: {
      filename: path.join('assets', '[name].js'),
    },
    optimization: {
      runtimeChunk: fixtureConfig.runtimeChunk,
    },
    plugins: [
      new HtmlWebpackPlugin(
        fixtureConfig.inject
          ? {}
          : {
              inject: fixtureConfig.inject,
              template: './template.ejs',
              publicPath: 'https://example.com',
            }
      ),

      new HtmlWebpackEntrypointsPlugin(),

      new MiniCssExtractPlugin({
        filename: 'assets/[name].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
  });

  // Create an input filesystem that is a union of the real disk filesystem and an in-memory
  // volume, so that unimportant files needed for the compilation don't have to exist on disk.
  compiler.inputFileSystem = ufs.use(fs).use(
    Volume.fromJSON(
      {
        './one.js': `require('./one.css')`,
        './one.css': '',
        './two.js': `require('./two.css')`,
        './two.css': '',
        './three.js': `require('./three.css')`,
        './three.css': '',
      },
      fixtureDir
    )
  );

  // Create an output filesystem that is an in-memory volume, so that the compilation doesn't
  // emit files to disk.
  compiler.outputFileSystem = createFsFromVolume(new Volume());

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats);
    });
  });
};
