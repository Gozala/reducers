"use strict";

var reducible = require("./reducible")
var accumulate = require("./accumulate")
var end = require("./end")
var isError = require("./is-error")

function reductions(source, f, initial) {
  /**
  Returns `reducible` collection of the intermediate values of the reduction
  (as per reduce) of `source` by `f`, starting with `initial` value.

  ## Example

  var numbers = reductions([1, 1, 1, 1], function(accumulated, value) {
    return accumulated + value
  }, 0)
  print(numbers) // => < 1 2 3 4 >
  **/
  return reducible(function reduceReducible(next, start) {
    var state = initial
    return accumulate(source, function reduceSource(value, result) {
      if (value === end) return next(end, result)
      if (isError(value)) return next(value, result)
      state = f(state, value)
      return next(state, result)
    }, start)
  })
}

module.exports = reductions
