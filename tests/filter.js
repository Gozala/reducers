/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var $ = require('../core'),
    into = $.into, filter = $.filter

exports['test filter'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = filter(source, function(item) {
    called = called + 1
    return item % 2
  })

  assert.equal(called, 0, 'filter does not invokes until result is reduced')
  assert.deepEqual(into(actual), [ 1, 3 ], 'items were filtered')
  assert.equal(called, 3, 'filterer called once per item')
}

if (module == require.main)
  require('test').run(exports)
