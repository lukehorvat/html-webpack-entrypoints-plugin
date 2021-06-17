const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlWebpackEntrypointsPlugin = require('../..');

module.exports = {
  mode: 'development',
  context: path.join(__dirname),
  entry: {
    app: './app.js',
  },
  output: {
    filename: path.join('assets', '[name].js'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, 'template.ejs'),
      publicPath: 'https://example.com',
    }),

    // new HtmlWebpackEntrypointsPlugin(),
  ],
};
