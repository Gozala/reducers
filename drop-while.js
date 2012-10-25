"use strict";

var transform = require("./transform")
var transformer = require("./transformer")

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
  return transformer(source, function(source) {
    var active = true
    return transform(source, function(next, value, result) {
      return active && (active = predicate(value)) ? result :
                                                     next(value, result)
    })
  })
}

module.exports = dropWhile
