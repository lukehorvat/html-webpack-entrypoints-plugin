const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const RUNTIME_ENTRYPOINT_NAME = '__runtime';

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
        entrypoints: this.getCompilationAssets(
          compilation,
          data.plugin.options.publicPath
        ),
      },
    };
  }

  getCompilationAssets(compilation, publicPath) {
    const runtimeChunks = this.getRuntimeChunks(compilation);
    const hasSingleRuntimeChunk = runtimeChunks.size === 1;

    return [...compilation.entrypoints].reduce(
      (entrypoints, [entrypointName, entrypoint]) => ({
        ...entrypoints,
        [entrypointName]: this.getEntrypointAssets(
          entrypoint,
          publicPath,
          !hasSingleRuntimeChunk
        ),
      }),
      hasSingleRuntimeChunk
        ? {
            // Consider the one (and only) runtime chunk its own special entrypoint.
            [RUNTIME_ENTRYPOINT_NAME]: this.getChunkAssets(
              runtimeChunks.values().next().value,
              publicPath
            ),
          }
        : {}
    );
  }

  getEntrypointAssets(entrypoint, publicPath, includeRuntimeChunk) {
    return entrypoint.chunks
      .filter(
        (chunk) => chunk !== entrypoint.getRuntimeChunk() || includeRuntimeChunk
      )
      .map((chunk) => this.getChunkAssets(chunk, publicPath))
      .reduce(
        (assets, { js, css }) => ({
          js: [...assets.js, ...js],
          css: [...assets.css, ...css],
        }),
        { js: [], css: [] }
      );
  }

  getChunkAssets(chunk, publicPath) {
    const assets = [...chunk.files].map(
      (asset) => appendTrailingSlash(publicPath) + asset
    );
    const js = assets.filter((asset) => path.extname(asset) === '.js');
    const css = assets.filter((asset) => path.extname(asset) === '.css');

    return { js, css };
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
