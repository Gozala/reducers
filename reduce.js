"use strict";

var deliver = require("eventual/deliver")
var defer = require("eventual/defer")
var when = require("eventual/when")
var accumulate = require("./accumulate")
var isError = require("./is-error")
var end = require("./end")

function reduce(source, next, initial) {
  var promise = defer()
  accumulate(source, function reduce(value, state) {
    if (value === end) deliver(promise, state)
    else if (isError(value)) deliver(promise, value)
    else state = next(state, value)

    return state
  }, initial)
  return when(promise, null, function(error) { return error })
}

module.exports = reduce
