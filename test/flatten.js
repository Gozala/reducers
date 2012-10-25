"use strict";

var flatten = require("../flatten")
var into = require("../into")

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

if (module == require.main)
  require("test").run(exports)
