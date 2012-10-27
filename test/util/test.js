"use strict";

var accumulate = require("../../accumulate")
var isError = require("../../is-error")

function test(f) {
  return function(assert, done) {
    f(function(actual, expected, comment) {
      var values = []
      accumulate(actual, function(actual) {
        if (isError(actual)) {
          assert.fail(actual)
          done()
        } else if (actual === null) {
          assert.deepEqual(values, expected, comment)
          done()
        } else if (actual && actual.isBoxed) {
          return actual
        } else {
          values.push(actual)
        }
        return actual
      })
    })
  }
}

module.exports = test
