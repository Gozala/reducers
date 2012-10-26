"use strict";

var accumulate = require("../../accumulate")
var end = require("../../end")
var error = require("../../error")

function test(f) {
  return function(assert, done) {
    f(function(actual, expected, comment) {
      var values = []
      accumulate(actual, function(actual) {
        if (actual && actual.is === error) {
          assert.fail(actual.value)
          done()
        } else if (actual && actual.is === end) {
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
