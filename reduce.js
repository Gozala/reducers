"use strict";

var deliver = require("eventual/deliver")
var defer = require("eventual/defer")
var when = require("eventual/when")
var accumulate = require("./accumulate")
var isError = require("./is-error")
var isReduced = require("./is-reduced")

function reduce(source, f, state) {
  var promise = defer()
  accumulate(source, function(value) {
    if (value === null) deliver(promise, state)
    else if (isError(value)) deliver(promise, value)
    else if (isReduced(value)) return value
    else return (state = f(state, value))
  }, state)
  return when(promise)
}

module.exports = reduce
