/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var $ = require('../core'),
    dropWhile = $.dropWhile, into = $.into

exports['test dropWhile'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = dropWhile(source, function(item) {
    called = called + 1
    return item <= 2
  })

  assert.equal(called, 0, 'dropWhile does not invokes until result is reduced')
  assert.deepEqual(into(actual), [ 3, 4 ], 'items were dropped')
  assert.equal(called, 3, 'dropWhile called until it returns false')
  assert.deepEqual(into(actual), [ 3, 4 ], 'can be re-reduced')
}

exports['test dropWhile none'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = dropWhile(source, function(item) {
    called = called + 1
    return false
  })

  assert.equal(called, 0, 'dropWhile does not invokes until result is reduced')
  assert.deepEqual(into(actual), [ 1, 2, 3 ], '0 items were dropped')
  assert.equal(called, 1, 'dropper called only once')
}

exports['test dropWhile all'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = dropWhile(source, function(item) {
    called = called + 1
    return true
  })

  assert.equal(called, 0, 'dropWhile does not invokes until result is reduced')
  assert.deepEqual(into(actual), [], 'all items were dropped')
  assert.equal(called, 3, 'dropper called on each item')
}


if (module == require.main)
  require('test').run(exports)
