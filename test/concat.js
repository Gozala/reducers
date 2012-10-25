"use strict";

var into = require("../into")
var concat = require("../concat")

exports["test append"] = function(assert) {
  var actual = concat([ 1 ], [ 2, 3 ], [ 4, 5, 6 ])

  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   "reducers were joined")
  assert.deepEqual(into(actual),
                   [ 1, 2, 3, 4, 5, 6 ],
                   "can be re-reduced")
}

if (module == require.main)
  require("test").run(exports)
