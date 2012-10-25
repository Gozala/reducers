"use strict";

var accumulated = require("./accumulated")
var transformer = require("./transformer")
var transform = require("./transform")


function take(source, n) {
  /**
  Returns sequence of first `n` items of the given `source`. If `source`
  contains less items than `n` then that's how  much items return sequence
  will contain.

  ## Example

  print(take([ 1, 2, 3, 4, 5 ], 2))   // => <stream 1 2 />
  print(take([ 1, 2, 3 ], 5))         // => <stream 1 2 3 />
  **/
  return transformer(source, function(source) {
    var count = n >= 0 ? n : Infinity
    return transform(source, function(next, value, result) {
      count = count - 1
      return count === 0 ? next(accumulated(), next(value, result)) :
             count > 0 ? next(value, result) :
                         next(accumulated(), result)
    })
  })
}

module.exports = take
