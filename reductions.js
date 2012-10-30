"use strict";

var reducible = require("./reducible")
var reduce = require("./reduce")

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
  return reducible(function reduceReducible(next, start) {
    var state = initial
    return reduce(source, function reduceSource(result, value) {
      state = f(state, value)
      return next(result, state)
    }, start)
  })
}

module.exports = reductions
