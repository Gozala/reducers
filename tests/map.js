/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var $ = require('../core'),
    map = $.map, into = $.into

exports['test map'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = map(source, function(item) {
    called = called + 1
    return item + 10
  })

  assert.equal(called, 0, 'map does not invokes until result is reduced')
  assert.deepEqual(into(actual), [ 11, 12, 13 ], 'values are mapped')
  assert.equal(called, 3, 'mapper called once per item')
}

if (module == require.main)
  require('test').run(exports)
