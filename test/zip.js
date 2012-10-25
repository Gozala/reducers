"use strict";

var zip = require("../zip")
var into = require("../into")
var concat = require("../concat")
var error = require("../error")
var capture = require("../capture")

exports["test zip with empty"] = function(assert) {
  var actual = into(zip([], [1, 2]))

  assert.deepEqual([], actual, "empty sequence zips to empty sequence")
}

exports["test zip 2 sequences"] = function(assert) {
  var actual = zip([ 1, 2, 3, 4 ], ["a", "b", "c", "d"])

  assert.deepEqual(into(actual), [
    [ 1, "a" ], [ 2, "b" ], [ 3, "c" ], [ 4, "d" ]
  ], "zip returns pairs of items")
}

exports["test zip sync stream with async stream"] = function(assert) {
  var actual = zip([5, 4, 3, 2, 1],
                   ["a", "b", "c", "d", "e"],
                   ["~", "@", "!", "#"])

  assert.deepEqual(into(actual), [
    [ 5, "a", "~"  ],
    [ 4, "b", "@" ],
    [ 3, "c", "!" ],
    [ 2, "d", "#" ]
  ], "zip three sequences into one")
}

exports["test zip with late error"] = function(assert) {
  var boom = Error("boom")
  var actual = zip(concat([3, 2, 1], error(boom)), ["a", "b", "c"])

  assert.deepEqual(into(actual), [
    [ 3, "a" ],
    [ 2, "b" ],
    [ 1, "c" ]
  ], "ziping is finished before error occured")
}

exports["test zip with early error"] = function(assert) {
  var boom = Error("Boom!!")
  var zipped = zip(concat([1, 2, 3], error(boom)), ["a", "b", "c", "d"])
  var actual = capture(zipped, function(error) { return [ "error" ] })

  assert.deepEqual(into(actual), [
    [ 1, "a" ],
    [ 2, "b" ],
    [ 3, "c" ],
    "error"
  ], "early erros propagate through the zipping")
}

if (module == require.main)
  require("test").run(exports)
