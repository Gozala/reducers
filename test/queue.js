"use strict";

var flatten = require("../flatten")
var take = require("../take")
var reduce = require("../reduce")
var into = require("../into")
var signal = require("../signal")
var emit = require("../emit")
var close = require("../close")
var queue = require("../queue")
var when = require("eventual/when")
var end = require("../end")

exports["test queue before open"] = function(assert, done) {
  var c = signal()
  var q = queue(c)

  emit(q, 1)
  emit(q, 2)

  var p = into(q)

  emit(q, 3)
  emit(q, 4)
  emit(q, end)

  when(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3, 4 ],
                     "queued values were consumed")
    done()
  })
}

if (require.main === module)
  require("test").run(exports)
