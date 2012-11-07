"use strict";

var accumulate = require("./accumulate")
var reducible = require("./reducible")

var slicer = Array.prototype.slice

function lazy(f) {
  /**
  Function takes `f` function and returns reducible equivalent of the one
  returned by invocation of `f`. The point is to create reducibles in a
  lazy manner.

  ## Example

  var time = lazy(function() {
    return Date.now()
  })

  Reducible will reduce to collection of one item which is a time that
  reduction has being invoked.
  **/
  var params = slicer.call(arguments, 1)
  return reducible(function(next, initial) {
    accumulate(f.apply(f, params), next, initial)
  })
}

module.exports = lazy
