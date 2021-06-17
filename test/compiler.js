const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { ufs } = require('unionfs');
const { Volume } = require('memfs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlWebpackEntrypointsPlugin = require('../..');

module.exports = (fixture) => {
  const fixtureDir = path.join(__dirname, 'fixtures', fixture);
  const fixtureConfig = JSON.parse(
    fs.readFileSync(path.join(fixtureDir, 'fixture.json'))
  );
  const compiler = webpack({
    mode: 'development',
    context: fixtureDir,
    entry: {
      app: './app.js',
    },
    output: {
      filename: path.join('assets', '[name].js'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: fixtureConfig.inject,
        template: './template.ejs',
        publicPath: 'https://example.com',
      }),

      // new HtmlWebpackEntrypointsPlugin(),
    ],
  });

  // Create a filesystem that is a union of the real disk filesystem and an in-memory volume.
  // This is done for two reasons:
  // 1. Webpack will emit the build to an in-memory filesystem location when running the tests.
  // 2. Unimportant files that are needed for the tests don't have to exist on disk.
  compiler.outputFileSystem = compiler.inputFileSystem = ufs.use(fs).use(
    Volume.fromJSON(
      {
        './app.js': '',
      },
      fixtureDir
    )
  );

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats);
    });
  });
};
