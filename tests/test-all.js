/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */

'use strict';

var reducers = require('../core')

exports['test into'] = function(assert) {
  var source = [ 1, 2, 3 ]
  assert.deepEqual(reducers.into(source), [ 1, 2, 3 ],
                   'returns identical')
  assert.notEqual(reducers.into(source), source,
                  'but different one')
}

exports['test into buffer'] = function(assert) {
  var buffer = [ 0 ]
  assert.equal(reducers.into([ 1, 2, 3 ], buffer), buffer,
               'reduces into buffer if provided')
  assert.deepEqual(buffer, [ 0, 1, 2, 3 ],
                   'pre-existing items in buffer are kept')
}

exports['test map'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = reducers.map(function(item) {
    called = called + 1
    return item + 10
  }, source)

  assert.equal(called, 0, 'map does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [ 11, 12, 13 ], 'values are mapped')
  assert.equal(called, 3, 'mapper called once per item')
}

exports['test filter'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = reducers.filter(function(item) {
    called = called + 1
    return item % 2
  }, source)

  assert.equal(called, 0, 'filter does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [ 1, 3 ], 'items were filtered')
  assert.equal(called, 3, 'filterer called once per item')
}

exports['test take'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = reducers.take(function(item) {
    called = called + 1
    return item <= 2
  }, source)

  assert.equal(called, 0, 'take does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [ 1, 2 ], 'items were taken')
  assert.equal(called, 3, 'taker called until it returns false')
  assert.deepEqual(reducers.into(actual), [ 1, 2 ], 'can be re-reduced')
}

exports['test take none'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = reducers.take(function(item) {
    called = called + 1
    return false
  }, source)

  assert.equal(called, 0, 'take does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [], '0 items were taken')
  assert.equal(called, 1, 'taker called once')
}

exports['test take all'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = reducers.take(function(item) {
    called = called + 1
    return true
  }, source)

  assert.equal(called, 0, 'take does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [ 1, 2, 3 ], 'all items were taken')
  assert.equal(called, 3, 'taker called on each item')
}

exports['test pick'] = function(assert) {
  var actual = reducers.pick(2, [ 1, 2, 3, 4 ])

  assert.deepEqual(reducers.into(actual), [ 1, 2 ], 'picked two items')
  assert.deepEqual(reducers.into(actual), [ 1, 2 ], 'can be re-reduced same')
}

exports['test pick none'] = function(assert) {
  var actual = reducers.pick(0, [ 1, 2, 3, 4 ])

  assert.deepEqual(reducers.into(actual), [], 'picks none on 0')
}

exports['test pick all'] = function(assert) {
  var actual = reducers.pick(100, [ 1, 2, 3, 4 ])

  assert.deepEqual(reducers.into(actual), [ 1, 2, 3, 4 ],
                   'picks all if has less than requested')
}

exports['test drop'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = reducers.drop(function(item) {
    called = called + 1
    return item <= 2
  }, source)

  assert.equal(called, 0, 'drop does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [ 3, 4 ], 'items were dropped')
  assert.equal(called, 3, 'drop called until it returns false')
  assert.deepEqual(reducers.into(actual), [ 3, 4 ], 'can be re-reduced')
}

exports['test drop none'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = reducers.drop(function(item) {
    called = called + 1
    return false
  }, source)

  assert.equal(called, 0, 'drop does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [ 1, 2, 3 ], '0 items were dropped')
  assert.equal(called, 1, 'dropper called only once')
}

exports['test drop all'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = reducers.drop(function(item) {
    called = called + 1
    return true
  }, source)

  assert.equal(called, 0, 'drop does not invokes until result is reduced')
  assert.deepEqual(reducers.into(actual), [], 'all items were dropped')
  assert.equal(called, 3, 'dropper called on each item')
}

exports['test skip'] = function(assert) {
  var actual = reducers.skip(2, [ 1, 2, 3, 4 ])

  assert.deepEqual(reducers.into(actual), [ 3, 4 ], 'skipped two items')
  assert.deepEqual(reducers.into(actual), [ 3, 4 ], 'can be re-reduced same')
}

exports['test skip none'] = function(assert) {
  var actual = reducers.skip(0, [ 1, 2, 3, 4 ])

  assert.deepEqual(reducers.into(actual), [ 1, 2, 3, 4 ], 'skips none on 0')
}

exports['test skip all'] = function(assert) {
  var actual = reducers.skip(100, [ 1, 2, 3, 4 ])

  assert.deepEqual(reducers.into(actual), [],
                   'skips all if has less than requested')
}

exports['test flatten'] = function(assert) {
  var source = [ [ 1 ], [ 2, 3 ], [ 4, 5, 6 ] ]
  var actual = reducers.flatten(source)

  assert.deepEqual(reducers.into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'flatten reducers')
  assert.deepEqual(reducers.into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'can be re-reduced')
  assert.deepEqual(source, [ [ 1 ], [ 2, 3 ], [ 4, 5, 6 ] ],
                   'no changes to a source')
}

exports['test join'] = function(assert) {
  var actual = reducers.join([ 1 ], [ 2, 3 ], [ 4, 5, 6 ])

  assert.deepEqual(reducers.into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'reducers were joined')
  assert.deepEqual(reducers.into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   'can be re-reduced')

}

if (module == require.main)
  require('test').run(exports);
