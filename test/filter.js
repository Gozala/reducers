"use strict";

var filter = require("../filter")
var into = require("../into")

exports["test filter"] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = filter(source, function(item) {
    called = called + 1
    return item % 2
  })

  assert.equal(called, 0, "filter does not invokes until result is reduced")
  assert.deepEqual(into(actual), [ 1, 3 ], "items were filtered")
  assert.equal(called, 3, "filterer called once per item")
}

if (module == require.main)
  require("test").run(exports)
