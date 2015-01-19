'use strict';

var fs = require('fs');
var test = require('tape');
var del = require('del');
var svgcss = require('./');

var output = '.tmp/test-output/';

test('Empty options', function (assert) {
  assert.plan(4);

  svgcss({}, function (err, res) {
    assert.equal(err, null, 'no error');
    assert.deepEqual(res, [], 'Empty result');
  });

  svgcss(undefined, function (err, res) {
    assert.equal(err, null, 'no error');
    assert.deepEqual(res, [], 'empty result');
  });
});

test('Basic usage', function (assert) {
  assert.plan(9);

  svgcss({
    source: 'fixtures/images/+(first|second)-image.svg'
  }, function (err, res) {
    assert.equal(err, null, 'no error');

    assert.equal(res.length, 2, 'number of images');

    assert.equal(res[0].namespace, 'icon', 'namespace');
    assert.equal(res[0].name, 'first-image', 'first image name');
    assert.equal(res[0].width, 10, 'width');
    assert.equal(res[0].height, 16, 'height');
    assert.equal(
      res[0].uri.substr(0, 26),
      'data:image/svg+xml;base64,',
      'SVG URI prefix'
    );
    assert.equal(
      res[0].css.substr(0, 66),
      '.icon-first-image{background-image:url("data:image/svg+xml;base64,',
      'css prefix'
    );

    assert.equal(res[1].name, 'second-image', 'second image name');
  });
});

test('Advanced usage', function (assert) {
  assert.plan(8);

  // start clean each time
  del(output, function () {
    svgcss({
      source: 'fixtures/images/template-image.svg',
      destination: output + 'name.ext',
      namespace: 'test',
      fallback: true,
      data: {width: 13},
      process: function (image) {
        return image.name + image.width;
      }
    }, function (err, res) {
      assert.equal(err, null, 'no error');
      assert.equal(res.length, 1, 'result length');
      assert.equal(res[0].namespace, 'test', 'namespace');
      assert.equal(res[0].width, 13, 'custom width');
      assert.equal(res[0].css, 'template-image13', 'image name');
      assert.equal(res[0].fallbackCss, 'template-image13', 'image name');
      console.log('<>', output + 'name.ext');
      fs.exists(output + 'name.ext', function (exists) {
        assert.ok(exists, 'css file exists');
      });

      fs.exists(output + 'name-fallback.ext', function (exists) {
        assert.ok(exists, 'fallback css file exists');
      });

    });
  });
});
