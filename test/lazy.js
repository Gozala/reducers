"use strict";

var test = require("./util/test")

var lazy = require("../lazy")
var concat = require("../concat")

exports["test lazy"]  = test(function(assert) {
  var called = 0
  var collected = []
  var value = lazy(function() {
    called = called + 1
    collected.push(called)
    return collected
  })

  var actual = concat(value, value, value)
  assert.equal(called, 0, "not called yet")

  assert(actual, [1, 1, 2, 1, 2, 3], "lazy delays creation of reducible")
})

if (module == require.main)
  require("test").run(exports)
