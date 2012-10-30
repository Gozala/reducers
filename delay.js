"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")
var isReduced = require("./is-reduced")

function delay(source, ms) {
  ms = ms || 3 // Minimum 3ms, as on less dispatch order becomes unreliable
  return convert(null, function(_, next, result) {
    var timeout = 0
    var ended = false
    accumulate(source, function(value) {
      setTimeout(function() {
        if (!ended) {
          timeout = timeout - ms
          result = next(value, result)
          if (isReduced(result)) {
            ended = true
            next(null, result.value)
          }
        }
      }, timeout = timeout + ms)
      return result
    })
  })
}

module.exports = delay
