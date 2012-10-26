"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")
var accumulated = require("./accumulated")
var error = require("./error")

function capture(source, recover) {
  /**
  Creates and returns safe version of given `source` sequence, by using
  `recover` function to recover from errors that may occur while reducing
  a `source`. This is a mechanism for error handling and recovery for streams
  that representing IO operations like (XHR / WebSockets etc...) where errors
  may occur.
  **/
  return convert(source, function(self, next, initial) {
    var failure = void(0)
    accumulate(source, function(value, result) {
      // If error has already being captured then return
      if (failure) return failure
      // If value is an error then continue accumulation of recovered
      // sequence.
      else if (value && value.is === error) {
        failure = accumulated(result)
        accumulate(recover(value.value, result), next, result)
        return failure
      }
      // Otherwise just forward messages.
      else return next(value, result)
    }, initial)
  })
}

module.exports = capture
