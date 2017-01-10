/* global phantom: false */

'use strict';

var system = require('system');
var webpage = require('webpage');

if (system.args.length != 3) {
  console.error('Usage: phantom-script.js uri width height');
  phantom.exit();
} else {
  render(system.args[0], Number(system.args[1]), Number(system.args[1]));
}

function render(uri, width, height) {
  var page = webpage.create();

  page.viewportSize = {
    width: width,
    height: height
  };

  page.open(uri, function (status) {
    if (status != 'success') {
      console.error('Unable to load URI.');
      phantom.exit();
      return;
    }

    console.log(page.renderBase64('PNG'));

    phantom.exit();
  });
}
