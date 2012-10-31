"use strict";

var reducible = require("./reducible")
var accumulate = require("./accumulate")
var isReduced = require("./is-reduced")
var end = require("./end")

function delay(source, ms) {
  ms = ms || 3 // Minimum 3ms, as on less dispatch order becomes unreliable
  return reducible(function(next, result) {
    var timeout = 0
    var ended = false
    accumulate(source, function(value) {
      setTimeout(function() {
        if (!ended) {
          timeout = timeout - ms
          result = next(value, result)
          if (isReduced(result)) {
            ended = true
            next(end)
          }
        }
      }, timeout = timeout + ms)
      return result
    })
  })
}

module.exports = delay
