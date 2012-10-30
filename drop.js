"use strict";

var reducible = require("./reducible")
var reduce = require("./reduce")

function drop(source, n) {
  /**
  Returns sequence of all `source`'s items after `n`-th one. If source contains
  less then `n` items empty sequence is returned.

  ## Example

  print(drop([ 1, 2, 3, 4 ], 2))  // => <stream 3 4 />
  print(drop([ 1, 2, 3 ], 5))     // => <stream />
  **/
  return reducible(function(next, initial) {
    var count = n >= 0 ? n : 1
    return reduce(source, function(result, value) {
      count = count - 1
      return count < 0 ? next(result, value) :
                         result
    }, initial)
  })
}

module.exports = drop
