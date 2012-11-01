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

    if (value === end) return deliver(promise, state)
    else if (isError(value)) return deliver(promise, value)

    state = next(state, value)

    if (isReduced(state)) deliver(promise, state.value)

    return state
  }, initial)
  return when(promise, null, function(error) { return error })
}

module.exports = reduce
