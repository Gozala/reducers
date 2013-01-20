"use strict";

var reduce = require("reducible/reduce")
var isError = require("reducible/is-error")
var end = require("reducible/end")
var isReduced = require("reducible/is-reduced")

function Assertor(owner, assert) {
  return function() { return assert.apply(owner, arguments) }
}

function test(unit) {
  return function(assertions, done) {
    function assert(actual, expected, comment) {
      var values = []
      reduce(actual, function(actual) {
        if (actual === end) {
          assert.deepEqual(values, expected, comment)
          done()
        } else if (isError(actual)) {
          assert.deepEqual({ values: values, error: actual }, expected, comment)
          done()
        } else if (isReduced(actual)) {
          return actual
        } else {
          values.push(actual)
        }
        return actual
      })
    }

    for (var key in assertions) {
      var assertor = assertions[key]
      if (typeof(assertor) === "function") {
        assert[key] = Assertor(assertions, assertor)
      }
    }

    unit(assert)
  }
}

module.exports = test
