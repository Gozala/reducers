"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")

function delay(source, ms) {
  ms = ms || 10 // Set minimum of 10ms, otherwise tests are unreliable
  return convert(source, function(_, next, result) {
    var timeout = 0
    accumulate(source, function(value) {
      setTimeout(function() {
        timeout = timeout - ms
        result = next(value, result)
      }, timeout = timeout + ms)
    })
  })
}

module.exports = delay
