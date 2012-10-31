"use strict";

var end = require("./end")
var reduce = require("./reduce")
var accumulate = require("./accumulate")
var reducible = require("./reducible")
var eventual = require("eventual/decorate")
var when = require("eventual/when")

var first = eventual(function(value) { return value })

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

  print(flatten([ [1, 2], [ 3, 4 ] ]))  // => < 1 2 3 4 />
  **/
  return reducible(function(next, initial) {
    // Result is accumulated into this outer variable as items from then
    // nested collections can come in time based order so it won't be passed
    // to in to reducer function.
    var result = initial
    var promise = reduce(source, function(promise, nested) {
      // we group results to make sure flattened stream won't finish until
      // all the streams are finished.
      return first(reduce(nested, function(_, value) {
        result = next(value, result)
        return result
      }), promise)
    }, source)
    when(promise, function(value) { next(end, value) }, next)
  })
}

module.exports = flatten
