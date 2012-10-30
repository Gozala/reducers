"use strict";

var reducible = require("./reducible")
var reduce = require("./reduce")

function dropWhile(source, predicate) {
  /**
  Returns a sequence of the items in `source` starting from the first
  item for which `predicate(item)` returns `false`.

  ## Example

  var numbers = dropWhile([ 2, 7, 10, 23 ], function(value) {
    return value < 10
  })
  print(numbers)   // => <stream 10 23 />
  **/
  return reducible(function reduceReducible(next, initial) {
    var dropping = true
    return reduce(source, function reduceSource(result, value) {
      dropping = dropping && (dropping = predicate(value))
      return dropping ? result :
                        next(result, value)
    }, initial)
  })
}

module.exports = dropWhile
