"use strict";

var deliver = require("eventual/deliver")
var defer = require("eventual/defer")
var when = require("eventual/when")
var accumulate = require("./accumulate")
var error = require("./error")

function reduce(source, f, state) {
  var promise = defer()
  accumulate(source, function(value) {
    if (value === null) deliver(promise, state)
    else if (value.is === error) deliver(promise, value.value)
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
