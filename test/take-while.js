"use strict";

var takeWhile = require("../take-while")
var into = require("../into")

exports["test takeWhile"] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = takeWhile(source, function(item) {
    called = called + 1
    return item <= 2
  })

  assert.equal(called, 0, "takeWhile does not invokes until result is reduced")
  assert.deepEqual(into(actual), [ 1, 2 ], "items were taken")
  assert.equal(called, 3, "taker called until it returns false")
  assert.deepEqual(into(actual), [ 1, 2 ], "can be re-reduced")
}

exports["test takeWhile none"] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = takeWhile(source, function(item) {
    called = called + 1
    return false
  })

  assert.equal(called, 0, "takeWhile does not invokes until result is reduced")
  assert.deepEqual(into(actual), [], "0 items were taken")
  assert.equal(called, 1, "taker called once")
}

exports["test takeWhile all"] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = takeWhile(source, function(item) {
    called = called + 1
    return true
  })

  assert.equal(called, 0, "takeWhile does not invokes until result is reduced")
  assert.deepEqual(into(actual), [ 1, 2, 3 ], "all items were taken")
  assert.equal(called, 3, "taker called on each item")
}

if (module == require.main)
  require("test").run(exports)
