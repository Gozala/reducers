/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
"use strict";

var take = require("../take")
var into = require("../into")

exports["test take"] = function(assert) {
  var actual = take([ 1, 2, 3, 4 ], 2)

  assert.deepEqual(into(actual), [ 1, 2 ], "picked two items")
  assert.deepEqual(into(actual), [ 1, 2 ], "can be re-reduced same")
}

exports["test take none"] = function(assert) {
  var actual = take([ 1, 2, 3, 4 ], 0)

  assert.deepEqual(into(actual), [], "picks none on 0")
}

exports["test take all"] = function(assert) {
  var actual = take([ 1, 2, 3, 4 ], 100)

  assert.deepEqual(into(actual), [ 1, 2, 3, 4 ],
                   "picks all if has less than requested")
}

if (module == require.main)
  require("test").run(exports)
