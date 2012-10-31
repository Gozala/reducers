"use strict";

var test = require("./util/test")
var lazy = require("./util/lazy")

var pipe = require("../pipe")
var concat = require("../concat")
var into = require("../into")
var signal = require("../signal")
var emit = require("../emit")
var cache = require("../cache")
var delay = require("../delay")
var flatten = require("../flatten")


exports["test pipe stream into not open"] = function(assert) {
  var s = signal()
  assert.throws(function() {
    pipe([ 1, 2, 3 ], s)
  }, "can't pipe if can't emit")
}

exports["test pipe multiple streams"] = test(function(assert) {
  var s = signal()
  var actual = into(s)
  pipe([1, 2, 3], s)
  pipe([4, 5, 6], s)


  assert(actual, [1, 2, 3],
         "first end causes close on output all subsequent pipes are ignored")
})

exports["test pipe multiple streams indepenently"] = test(function(assert) {
  var s = signal()
  var actual = into(s)
  pipe(delay([1, 2, 3]), s)
  pipe(delay([4, 5, 6, 7]), s)

  // note that `6` goes through since `end` is also dispatched with a delay.
  assert(actual, [1, 4, 2, 5, 3, 6],
         "parallel pipe works until first end")
})

exports["test pipe multiple streams"] = test(function(assert) {
  var s = signal()
  var actual = into(s)

  pipe(flatten([[1, 2, 3], [4, 5], [ 6, 7 ]]), s)

  // note that `6` goes through since `end` is also dispatched with a delay.
  assert(actual, [1, 2, 3, 4, 5, 6, 7],
         "parallel pipe works until first end")
})

if (require.main === module)
  require("test").run(exports)
