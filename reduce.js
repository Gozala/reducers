"use strict";

var deliver = require("eventual/deliver")
var defer = require("eventual/defer")
var when = require("eventual/when")
var accumulate = require("./accumulate")
var isError = require("./is-error")
var isReduced = require("./is-reduced")
var end = require("./end")

function reduce(source, next, initial) {
  var promise = defer()
  accumulate(source, function reduce(value, state) {
    // If source is `end`-ed deliver accumulated `state`.
    if (value === end) return deliver(promise, state)
    // If is source has an error, deliver that.
    else if (isError(value)) return deliver(promise, value)

    // Accumulate new `state`
    try { state = next(state, value) }
    // If exception is thrown at accumulation deliver thrown error.
    catch (error) { return deliver(promise, error), error }

    // If already reduced, then deliver.
    if (isReduced(state)) deliver(promise, state.value)

    return state
  }, initial)

  // Wrap in `when` in case `promise` is already delivered to return an
  // actual value.
  return when(promise)
}

module.exports = reduce
