"use strict";

var test = require("./util/test")
var lazy = require("./util/lazy")

var into = require("../into")
var concat = require("../concat")
var buffer = require("../buffer")
var delay = require("../delay")

exports["test cache reads once"] = function(assert) {
  var called = 0
  var source = concat(lazy(function() {
                        called = called + 1
                        return 0
                      }),
                      [1, 2, 3])

  var b = buffer(source)

  assert.equal(called, 1, "buffer is greedy")
  assert.deepEqual(into(b), [ 0, 1, 2, 3 ], "values are dispatched")
  assert.deepEqual(into(b), [ 0, 1, 2, 3 ], "buffers only once")
  assert.equal(1, called, "source was buffered")
}

exports["test async buffer"] = test(function(assert) {
  var source = delay([1, 2, 3])
  var actual = buffer(source)

  assert(actual, [1, 2, 3], "async streams are buffered fine")
})

exports["test multiple reads from async buffer"] = test(function(assert) {
  var source = delay([1, 2, 3])
  var b = buffer(source)
  var actual = concat(into(b), into(b))

  assert(actual, [1, 2, 3, 1, 2, 3], "multiple reads from async buffer")
})

exports["test errored buffer"] = test(function(assert) {
  var source = [1, 2, 3, Error("boom"), 4, 5]
  var actual = buffer(source)

  assert(actual, {
    values: [1, 2, 3],
    error: Error("boom")
  }, "errors propagate")
})

if (require.main === module)
  require("test").run(exports)
