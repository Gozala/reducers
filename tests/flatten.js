/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var into = require('../core').into
var flatten = require('../accumulator').flatten

exports['test flatten'] = function(assert) {
  var source = [ [ 1 ], [ 2, 3 ], [ 4, 5, 6 ] ]
  var actual = flatten(source)

  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'flatten reducers')
  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'can be re-reduced')
  assert.deepEqual(source, [ [ 1 ], [ 2, 3 ], [ 4, 5, 6 ] ],
                   'no changes to a source')
}

if (module == require.main)
  require('test').run(exports)
