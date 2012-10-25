"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")
var end = require("./end")

var slicer = Array.prototype.slice

function append(left, right) {
  /**
  Returns sequences of items in the `left` sequence followed by the
  items in the `right` sequence.
  **/
  return convert({}, function(self, next, initial) {
    accumulate(left, function(value, result) {
      return value && value.is === end ? accumulate(right, next, result) :
                                         next(value, result)
    }, initial)
  })
}

function concat(left, right /*, ...rest*/) {
  /**
  Returns a sequence representing the concatenation of the elements in the
  supplied arguments, in the given order.

  print(concat([ 1 ], [ 2, 3 ], [ 4, 5, 6 ])) // => <stream 1 2 3 4 5 6 />

  **/
  switch (arguments.length) {
    case 1: return left
    case 2: return append(left, right)
    default: return slicer.call(arguments).reduce(append)
  }
}

module.exports = concat
