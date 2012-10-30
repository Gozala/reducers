"use strict";

var accumulate = require("./accumulate")
var when = require("eventual/when")

function Reducible(reduce) {
  /**
  Reducible is a type of the data-structure that represents something
  that can be reduced. Most of the time it's used to represent transformation
  over other reducible by capturing it in a lexical scope.

  Reducible has an attribute `reduce` pointing to a function that does
  reduction.
  **/

  // JS engines optimize access to properties that are set in the constructor's
  // so we set it here.
  this.reduce = reduce
}
// Implementation of `accumulate` for reducible, which just delegates to it's
// `reduce` attribute.
accumulate.define(Reducible, function accumulate(reducible, next, initial) {
  var result = reducible.reduce(function forward(state, value) {
    // We actually just inverse order of arguments here.
    return next(value, state)
  }, initial)

  // When result is ready dispatch end of stream and aggregated value.
  // If result errors also forward that.
  when(result, function ondeliver(value) { next(null, value) }, next)
})

function reducible(reduce) {
  return new Reducible(reduce)
}

module.exports = reducible
