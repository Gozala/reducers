"use strict";

var reduce = require("./reduce")
var reducible = require("./reducible")

function flatten(source) {
  /**
  Flattens given sequence of sequences to a sequence with items of
  all nested sequences. Note that items in the resulting sequence
  are ordered by the time rather then index, in other words if
  item from the second sub-sequence is deliver earlier then the item
  from first sub-sequence it will in appear earlier in the resulting
  sequence too. If you need to keep order by index you should enforce
  sequential ordering by wrapping `source` into `sequential` before
  passing it to flatten.

  print(flatten([ [1, 2], [ 3, 4 ] ]))  // => <stream 1 2 3 4 />
  **/
  return reducible(source, function(_, next, initial) {
    return reduce(source, function(result, nested) {
      return reduce(nested, function(result, value) {
        return next(result, value)
      }, result)
    }, initial)
  })
}

module.exports = flatten
