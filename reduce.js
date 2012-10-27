"use strict";

var deliver = require("eventual/deliver")
var defer = require("eventual/defer")
var when = require("eventual/when")
var accumulate = require("./accumulate")
var isError = require("./is-error")

function reduce(source, f, state) {
  var promise = defer()
  accumulate(source, function(value) {
    if (value === null) deliver(promise, state)
    else if (isError(value)) deliver(promise, value)
    else if (value && value.isBoxed) {
      return value
    } else {
      state = f(state, value)
      return state
    }
  }, state)
  return when(promise)
}

module.exports = reduce
