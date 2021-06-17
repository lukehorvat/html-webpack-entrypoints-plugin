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

            const { publicPath } = data.plugin.options;
            const runtimeChunks = new Set(
              [...compilation.entrypoints.values()].map((entrypoint) => {
                return entrypoint.chunks.find(
                  (chunk) =>
                    chunk.name ===
                    compilation.options.optimization.runtimeChunk.name(
                      entrypoint
                    )
                );
              })
            );
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
}

function appendTrailingSlash(str) {
  return str.replace(/[^\/]$/, (match) => `${match}/`);
}

module.exports = HtmlWebpackEntrypointsPlugin;
