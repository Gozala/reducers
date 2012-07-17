/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var $ = require('../core'),
    into = $.into, drop = $.drop

exports['test drop'] = function(assert) {
  var actual = drop([ 1, 2, 3, 4 ], 2)

  assert.deepEqual(into(actual), [ 3, 4 ], 'skipped two items')
  assert.deepEqual(into(actual), [ 3, 4 ], 'can be re-reduced same')
}

exports['test drop none'] = function(assert) {
  var actual = drop([ 1, 2, 3, 4 ], 0)

  assert.deepEqual(into(actual), [ 1, 2, 3, 4 ], 'skips none on 0')
}

exports['test drop all'] = function(assert) {
  var actual = drop([ 1, 2, 3, 4 ], 100)

  assert.deepEqual(into(actual), [],
                   'skips all if has less than requested')
}

if (module == require.main)
  require('test').run(exports)
