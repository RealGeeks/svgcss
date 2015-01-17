# SVGCSS

Embed SVG files in CSS as data URIs with PNG fallback.

## API

```js
var svgcss = require('svgcss');
var options = {
  source: 'images/*.svg',
  destination: 'css'
};
var callback = function (err, result) {
  // do something with result
};

svgcss(options, callback);
```

### `options`

The first argument to `svgcss` is an options object which can have any of the following properties:

+ `source`: glob that should match the svg files that should be used.
+ `destination`: the path to a folder where _CSS_ files will be written to. The folder must exist.
+ `fallback`: When `true`, converts _SVG_s to _PNG_ and creates an additional _CSS_ file with the _PNG_ URIs embedded. Defaults to `false`.
+ `namespace`: used to prefix _CSS_ class names. Defaults to `icon`.
+ `data`: if present, gets passed as data to the [templating method](https://lodash.com/docs#template) together with each _SVG_ file.
+ `process`: override the function that generates the `CSS` code. An `image` object with `name`, `namespace`, `width`, `height` and `uri` is passed in.

### `callback`

The callback receives an error object or `null` as the first argument. The second argument is an array of of objects, one for each _SVG_ source file, with `name`, `namespace`, `width`, `height`, `uri`, `css` and optionally `fallbackCSS` properties.
