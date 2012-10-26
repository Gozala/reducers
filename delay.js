"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")
var eventual = require("eventual/decorate")
var defer = require("eventual/defer")
var deliver = require("eventual/deliver")
var when = require("eventual/when")

function delay(source, ms) {
  ms = ms || 1
  return convert(source, function(_, next, result) {
    var forward = eventual(next)
    accumulate(source, eventual(function(value, result) {
      var deferred = defer()
      setTimeout(deliver, ms, deferred, value)
      return forward(deferred, result)
    }), result)
  })
}

module.exports = delay
