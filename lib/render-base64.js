'use strict';

var execFile = require('child_process').execFile;

var phantomPath = require('phantomjs').path;
var phantomScript = require('path').resolve(__dirname, './phantom-script.js');

module.exports = function (uri, width, height, callback) {
  var args = [phantomScript, uri, width, height];
  execFile(phantomPath, args, function (err, stdout, stderr) {
    if (err) {
      callback(err);
    } else if (stderr.length) {
      callback(new Error(stderr.toString().trim()));
    } else {
      callback(null, stdout.toString().trim());
    }
  });
};
