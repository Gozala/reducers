"use strict";

var into = require("../into")
var reduce = require("../reduce")
var signal = require("../signal")
var emit = require("../emit")
var close = require("../close")
var buffer = require("../buffer")

var when = require("eventual/when")

exports["test signal bufferring"] = function(assert, done) {
  var c = signal()
  var b = buffer(c)

  assert.ok(signal.isOpen(c), "buffer opens a signal")

  emit(c, 1)
  emit(c, 2)

  var p = reduce(b, function(result, value) {
    result.push(value)
    return result
  }, [])

  emit(c, 3)
  close(c, 4)

  when(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3, 4 ],
                     "values have being buffered")
    done()
  })
}

if (module == require.main)
  require("test").run(exports)
