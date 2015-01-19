'use strict';

var path = require('path');
var join = path.join;
var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;
var fs = require('fs');
var read = fs.readFileSync;
var writeFile = fs.writeFile;
var mkdirp = require('mkdirp');
var glob = require('glob');
var async = require('async');
var parallel = async.parallel;
var map = async.map;
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

var addSuffix = function (path, suffix) {
  var ext = extname(path);

  return path.slice(0, -ext.length) + '-' + suffix + ext;
};

var write = function (path, contents, callback) {
  mkdirp(dirname(path), function (err) {
    if (err) {
      callback(err);
    }

    writeFile(path, contents, callback);
  });
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
  var fallback = options.fallback;

  if (destination) {
    destination = join(process.cwd(), destination);

    if (fallback && typeof fallback != 'string') {
      fallback = addSuffix(destination, 'fallback');
    }
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

            if (fallback) {
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
          parallel([
            function (callback) {
              write(destination, pluck(images, 'css').join('\n'), callback);
            },
            function (callback) {
              if (fallback) {
                write(
                  fallback,
                  pluck(images, 'fallbackCss').join('\n'),
                  callback
                );
              } else {
                callback(null);
              }
            }
          ], function (err) {
            if (err) {
              done(err);
              return;
            }

            done(null, images);
          });

        } else {
          done(null, images);
        }
      }
    );
  });
};
