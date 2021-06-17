const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class HtmlWebpackEntrypointsPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'HtmlWebpackEntrypointsPlugin',
      (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tap(
          'HtmlWebpackEntrypointsPlugin',
          this.run.bind(this, compilation)
        );
      }
    );
  }

  run(compilation, data) {
    if (data.plugin.options.inject) {
      throw new Error('This plugin cannot be used with `{ inject: true }`.');
    }

    if (compilation.entrypoints.size <= 1) {
      throw new Error('This plugin cannot be used with a single entrypoint.');
    }

    return {
      ...data,
      assets: {
        ...data.assets,
        entrypoints: this.getAssetsPerEntrypoint(
          compilation,
          data.plugin.options.publicPath
        ),
      },
    };
  }

  getAssetsPerEntrypoint(compilation, publicPath) {
    const runtimeChunks = this.getRuntimeChunks(compilation);

    return [...compilation.entrypoints].reduce(
      (entrypoints, [entrypointName, entrypoint]) => {
        const assets = entrypoint.chunks
          .filter(
            (chunk) => runtimeChunks.size !== 1 || !runtimeChunks.has(chunk)
          )
          .reduce((files, chunk) => [...files, ...chunk.files], [])
          .map((asset) => appendTrailingSlash(publicPath) + asset);
        const scripts = assets.filter((asset) => path.extname(asset) === '.js');
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
              js: [...runtimeChunks.values().next().value.files].map(
                (asset) => appendTrailingSlash(publicPath) + asset
              ),
            },
          }
        : {}
    );
  }

  getRuntimeChunks(compilation) {
    return new Set(
      [...compilation.entrypoints.values()].map((entrypoint) =>
        entrypoint.getRuntimeChunk()
      )
    );
  }
}

function appendTrailingSlash(str) {
  return str.replace(/[^\/]$/, (match) => `${match}/`);
}

module.exports = HtmlWebpackEntrypointsPlugin;
