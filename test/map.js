"use strict";

var map = require("../map")
var into = require("../into")

exports["test map"] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = map(source, function(item) {
    called = called + 1
    return item + 10
  })

  assert.equal(called, 0, "map does not invokes until result is reduced")
  assert.deepEqual(into(actual), [ 11, 12, 13 ], "values are mapped")
  assert.equal(called, 3, "mapper called once per item")
}

if (module == require.main)
  require("test").run(exports)
