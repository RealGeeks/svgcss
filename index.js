'use strict';

var path = require('path');
var join = path.join;
var basename = path.basename;
var extname = path.extname;
var fs = require('fs');
var read = fs.readFileSync;
var write = fs.writeFileSync;
var glob = require('glob');
var map = require('async').map;
var _ = require('lodash');
var template = _.template;
var pluck = _.pluck;
var defaults = _.defaults;
var Svgo = require('svgo');
var svgo = new Svgo();
var renderBase64Png = require('./lib/render-base64');

var baseName = function (path) {
  return basename(path, extname(path));
};

var blowUp = function (err) {
  if (err) {
    throw new Error(err);
  }
};

var defaultOptions = {
  namespace: 'icon',
  source: '',
  process: function (image) {
    return '.' + image.namespace + '-' + image.name + '{' +
      'background-image:url("' + image.uri + '")' +
    '}';
  },
  data: {}
};

module.exports = function (options, done) {
  options = defaults({}, options, defaultOptions);
  done = done || blowUp;

  var namespace = options.namespace;
  var destination = options.destination;

  if (destination) {
    destination = join(process.cwd(), destination);
  }

  glob(options.source, function (err, files) {
    if (err) {
      done(err);
      return;
    }

    map(files,
      function processFile(filename, callback) {
        svgo.optimize(
          template(read(filename, 'utf8'), options.data),
          function (result) {
            var svgUri = 'data:image/svg+xml;base64,' +
              new Buffer(result.data).toString('base64');

            var width = parseInt(result.info.width, 10);
            var height = parseInt(result.info.height, 10);

            var image = {
              name: baseName(filename),
              namespace: namespace,
              width: width,
              height: height,
              uri: svgUri
            };

            image.css = options.process(image);

            if (options.fallback) {
              renderBase64Png(svgUri, width, height, function (err, base64Png) {
                if (err) {
                  callback(err);
                }

                image.fallbackCss = options.process(defaults({
                  uri: 'data:image/png;base64,' + base64Png
                }, image));

                callback(null, image);
              });
            } else {
              callback(null, image);
            }
          }
        );
      },

      function (err, images) {
        if (err) {
          done(err);
          return;
        }

        if (destination) {
          write(join(destination, namespace + '.css'), pluck(images, 'css').join('\n'));

          if (options.fallback) {
            write(
              join(destination, namespace + '-fallback.css'),
              pluck(images, 'fallbackCss').join('\n')
            );
          }
        }

        done(null, images);
      }
    );
  });
};
