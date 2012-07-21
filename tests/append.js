/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var into = require('../accumulator').into
var append = require('../core').append

exports['test append'] = function(assert) {
  var actual = append([ 1 ], [ 2, 3 ], [ 4, 5, 6 ])

  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'reducers were joined')
  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'can be re-reduced')
}

if (module == require.main)
  require('test').run(exports)
