# html-webpack-entrypoints-plugin

An extension to [`html-webpack-plugin`](https://github.com/jantimon/html-webpack-plugin) that groups JS/CSS assets by entry point.

This is a niche plugin that you should only think about using if you meet the following criteria:

- You've configured multiple entry points in your Webpack config.
- You've specified `{ inject: false }` for `html-webpack-plugin` because you want control over asset placement in the template.
- You want _even greater_ control over asset placement – the ability to place the assets for _each entry point_ at different locations in the template.

See the [usage](#usage) section below for examples.

## Installation

Install the package via npm:

```sh
$ npm install html-webpack-entrypoints-plugin
```

And then add it to the `plugins` in your Webpack config:

```js
const HtmlWebpackEntrypointsPlugin = require('html-webpack-entrypoints-plugin');
```

```js
new HtmlWebpackEntrypointsPlugin()
```

## Usage

I hope the following usage examples illustrate how the plugin provides more fine-grained control over asset placement in the template (compared to what `html-webpack-plugin` offers).

### Multiple entrypoints + no runtime chunks

Webpack config:

```js
{
  entry: {
    one: './one.js',
    two: './two.js',
    three: './three.js',
  },
  optimization: {
    runtimeChunk: false,
  },
}
```

Template:

```ejs
<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.one.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>

<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.two.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>

<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.three.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>
```

Output HTML:

```html
<script src="one.js"></script>

<script src="two.js"></script>

<script src="three.js"></script>
```

### Multiple entrypoints + multiple runtime chunks

Webpack config:

```js
{
  entry: {
    one: './one.js',
    two: './two.js',
    three: './three.js',
  },
  optimization: {
    runtimeChunk: 'multiple', // or `runtimeChunk: true`
  },
}
```

Template:

```ejs
<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.one.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>

<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.two.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>

<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.three.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>
```

Output HTML:

```html
<script src="runtime~one.js"></script>
<script src="one.js"></script>

<script src="runtime~two.js"></script>
<script src="two.js"></script>

<script src="runtime~three.js"></script>
<script src="three.js"></script>
```

### Multiple entrypoints + single runtime chunk

Webpack config:

```js
{
  entry: {
    one: './one.js',
    two: './two.js',
    three: './three.js',
  },
  optimization: {
    runtimeChunk: 'single',
  },
}
```

Template:

```ejs
<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints._runtime.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>

<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.one.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>

<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.two.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>

<% for (var scriptUrl of htmlWebpackPlugin.files.entrypoints.three.js) { %>
  <script src="<%= scriptUrl %>"></script>
<% } %>
```

Output HTML:

```html
<script src="runtime.js"></script>

<script src="one.js"></script>

<script src="two.js"></script>

<script src="three.js"></script>
```
