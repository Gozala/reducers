"use strict";

var accumulate = require("./accumulate")
var make = Object.create || (function() {
  function Type() {}
  return function make(prototype) {
    Type.prototype = prototype
    return new Type()
  }
})()


function convert(source, method) {
  /**
  Function takes `source` sequence and returns new `sequence` such
  that calling `accumulate` on it will delegate to given `method`.
  This is to make sequence conversions lazy.

  // Code will produce sequence that is just like `source` but with
  // each element being incremented.
  function increment(source) {
    return convert(source, function(sequence, f, start) {
      return accumulate(source, function(value, result) {
        return f(value + 1, result)
      }, start)
    })
  }
  into(increment([ 1, 2, 3 ])) => [ 2, 3, 4 ]
  **/
  return accumulate.implement(make(source), method)
}

module.exports = convert
