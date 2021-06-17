# html-webpack-entrypoints-plugin

An extension to [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) that groups JS/CSS assets by entry point.

This is a niche plugin that you should only think about using if you meet the following criteria:

- You've configured multiple entry points in your Webpack config.
- You've specified `{ inject: false }` for html-webpack-plugin because you want control over asset placement in the template.
- You want _even greater_ control over asset placement – the ability to place the assets for _each entry point_ at different locations in the template.

If this still sounds unclear, see the [usage](#usage) section below for an example.

## Installation

Install the package via npm:

```sh
$ npm install html-webpack-entrypoints-plugin
```

## Usage

TODO.
