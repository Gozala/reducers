"use strict";

var flatten = require("../flatten")
var take = require("../take")
var reduce = require("../reduce")
var into = require("../into")
var signal = require("../signal")
var emit = require("../emit")
var close = require("../close")
var queue = require("../queue")
var await = require("pending/await")

exports["test queue before open"] = function(assert, done) {
  var c = signal()
  var q = queue(c)

  assert.ok(!signal.isOpen(q), "queue is not open")

  emit(q, 1)
  emit(q, 2)

  var p = into(q)

  emit(q, 3)
  close(q, 4)

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3, 4 ],
                     "queued values were consumed")
    done()
  })
}

if (module == require.main)
  require("test").run(exports)
