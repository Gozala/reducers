"use strict";

var test = require("./util/test")
var lazy = require("./util/lazy")

var concat = require("../concat")
var into = require("../into")
var delay = require("../delay")
var error = require("../error")
var capture = require("../capture")
var map = require("../map")
var expand = require("../expand")
var take = require("../take")
var flatten = require("../flatten")
var into = require("../into")
var sequential = require("../sequential")

exports["test flatten"] = function(assert) {
  var source = [ [ 1 ], [ 2, 3 ], [ 4, 5, 6 ] ]
  var actual = flatten(source)

  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   "flatten reducers")
  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   "can be re-reduced")
  assert.deepEqual(source, [ [ 1 ], [ 2, 3 ], [ 4, 5, 6 ] ],
                   "no changes to a source")
}

exports["test flatten stream of empty streams"] = test(function(assert) {
  var actual = flatten([[], []])

  assert(actual, [], "flatten of empty streams is empty")
})

exports["test flatten empty & non-empty"] = test(function(assert) {
  var actual = flatten([[], [1, 2], []])

  assert(actual, [1, 2], "flatten with empties is non-empty")
})

exports["test flatten flattened"] = test(function(assert) {
  var stream = flatten([[1, 2], ["a", "b"]])
  var actual = flatten([[">"], stream, []])

  assert(actual, [">", 1, 2, "a", "b"], "flattening flattened works")
})

exports["test flatten sync & async streams"] = test(function(assert) {
  var async = delay([3, 2, 1])
  var actual = flatten([async, ["|"], async, ["a", "b"], []])

  assert(actual, ["|", "a", "b", 3, 3, 2, 2, 1, 1], "orders by time")
})

exports["test flatten sync & async streams"] = test(function(assert) {
  var async = delay([3, 2, 1])
  var actual = flatten(sequential([async, ["|"], async, ["a", "b"], []]))

  assert(actual, [3, 2, 1, "|", 3, 2, 1, "a", "b"],
         "sequentialized flatten")
})

exports["test flatten with broken stream"] = test(function(assert) {
  var boom = Error("Boom!")
  var async = delay(concat([3, 2, 1], error(boom)))
  var flattened = flatten([[">"], async, [1, 2]])
  var actual = capture(flattened, function(error) {
    return error.message
  })

  assert(actual, [">", 1, 2, 3, 2, 1, boom.message], "errors propagate")
})

exports["test flatten with broken sequential stream"] = test(function(assert) {
  var boom = Error("Boom!")
  var async = delay(concat([3, 2, 1], error(boom)))
  var flattened = flatten(sequential([[">"], async, [1, 2]]))
  var actual = capture(flattened, function(error) {
    return error.message
  })

  assert(actual, [">", 3, 2, 1, boom.message], "errors propagate")
})

exports["test flatten sequential async stream of streams"] = test(function(assert) {
  var async = delay([3, 2, 1])
  var actual = flatten(sequential([[], [1, 2], async, ["a", "b"], async]))

  assert(actual, [1, 2, 3, 2, 1, "a", "b", 3, 2, 1], "mixed stream works")
})

exports["test flatten async stream of streams"] = test(function(assert) {
  var async = delay([3, 2, 1])
  var actual = flatten([[], [1, 2], async, ["a", "b"], async])

  assert(actual, [1, 2, "a", "b", 3, 3, 2, 2, 1, 1], "mixed stream works")
})

exports["test flatten async sequential stream of streams"] = test(function(assert) {
  var async = delay([3, 2, 1])
  var actual = flatten(sequential([[], [1, 2], async, ["a", "b"], async]))

  assert(actual, [1, 2, 3, 2, 1, "a", "b", 3, 2, 1],
         "sequential stream of streams stream works")
})

if (module == require.main)
  require("test").run(exports)
