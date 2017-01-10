'use strict';

var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path

module.exports = function (uri, width, height, callback) {
  var childArgs = [
    path.join(__dirname, 'phantom-script.js'),
    uri,
    width,
    height
  ];

  childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    if (err) {
      callback(err);
    } else if (stderr.length) {
      callback(new Error(stderr.toString().trim()));
    } else {
      callback(null, stdout.toString().trim());
    }
  });
};
