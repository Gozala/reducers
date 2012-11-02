"use strict";

var accumulate = require("../../accumulate")
var isError = require("../../is-error")
var end = require("../../end")
var isReduced = require("../../is-reduced")

function test(unit) {
  return function(assertions, done) {
    function assert(actual, expected, comment) {
      var values = []
      accumulate(actual, function(actual) {
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

    for (var key in assertions) assert[key] = assertions[key].bind(assertions)

    unit(assert)
  }
}

module.exports = test
