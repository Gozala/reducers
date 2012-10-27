"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")
var isError = require("./is-error")

function reductions(source, f, initial) {
  /**
  Returns `reducible` collection of the intermediate values of the reduction
  (as per reduce) of `source` by `f`, starting with `initial` value.

  ## Example

  var numbers = reductions([1, 1, 1, 1], function(accumulated, value) {
    return accumulated + value
  }, 0)
  print(numbers) // => <stream 1 2 3 4 />
  **/
  return convert(source, function(self, next, result) {
    var state = initial
    accumulate(source, function(value, result) {
      state = value === null ? next(null, result) :   // propagate end of stream
              isError(value) ? next(value, result) :  // propagate errors
              f(state, value)                         // dispatch otherwise
      return next(state, result)
    }, result)
  })
}

module.exports = reductions
