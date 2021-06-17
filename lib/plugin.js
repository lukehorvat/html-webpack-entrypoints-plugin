const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class HtmlWebpackEntrypointsPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'HtmlWebpackEntrypointsPlugin',
      (compilation) => {
        HtmlWebpackPlugin.getHooks(
          compilation
        ).beforeAssetTagGeneration.tapAsync(
          'HtmlWebpackEntrypointsPlugin',
          (data, callback) => {
            if (data.plugin.options.inject) {
              return callback(
                new Error(
                  'This plugin is not intended to be used with `{ inject: true }`.'
                )
              );
            }

            if (compilation.entrypoints.size <= 1) {
              return callback(
                new Error(
                  'This plugin is not intended to be used with a single entrypoint.'
                )
              );
            }

            const { publicPath } = data.plugin.options;
            const runtimeChunks = this.getRuntimeChunks(compilation);
            const entrypointAssets = [...compilation.entrypoints].reduce(
              (entrypoints, [entrypointName, entrypoint]) => {
                const assets = entrypoint.chunks
                  .filter(
                    (chunk) =>
                      runtimeChunks.size !== 1 || !runtimeChunks.has(chunk)
                  )
                  .reduce((files, chunk) => [...files, ...chunk.files], [])
                  .map((asset) => appendTrailingSlash(publicPath) + asset);
                const scripts = assets.filter(
                  (asset) => path.extname(asset) === '.js'
                );
                const stylesheets = assets.filter(
                  (asset) => path.extname(asset) === '.css'
                );

                return {
                  ...entrypoints,
                  [entrypointName]: {
                    js: scripts,
                    css: stylesheets,
                  },
                };
              },
              runtimeChunks.size === 1
                ? {
                    __runtime: {
                      js: [...runtimeChunks][0].files.map(
                        (asset) => appendTrailingSlash(publicPath) + asset
                      ),
                    },
                  }
                : {}
            );
            data.assets.entrypoints = entrypointAssets;

            callback(null, data);
          }
        );
      }
    );
  }

  getRuntimeChunks(compilation) {
    return new Set(
      Array.from(compilation.entrypoints.values()).map((entrypoint) =>
        entrypoint.getRuntimeChunk()
      )
    );
  }
}

function appendTrailingSlash(str) {
  return str.replace(/[^\/]$/, (match) => `${match}/`);
}

module.exports = HtmlWebpackEntrypointsPlugin;
