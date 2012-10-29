"use strict";

var deliver = require("eventual/deliver")
var defer = require("eventual/defer")
var when = require("eventual/when")
var accumulate = require("./accumulate")
var isError = require("./is-error")
var isReduced = require("./is-reduced")
var reduced = require("./reduced")

function reduce(source, f, state) {
  var promise = defer()
  accumulate(source, function reduce(value) {
    if (value === null) return reduced(deliver(promise, state))
    else if (isError(value)) return reduced(deliver(promise, value))
    else if (isReduced(value)) return value
    else return (state = f(state, value))
  }, state)
  return when(promise)
}

module.exports = reduce
