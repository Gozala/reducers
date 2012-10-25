"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")
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
    accumulate(source, function(value, result) {
      if (value && value.is === error) {
        accumulate(recover(value.value, result), next, result)
      } else {
        next(value, result)
      }
    }, initial)
  })
}

module.exports = capture
