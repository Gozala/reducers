"use strict";

var convert = require("./convert")
var when = require("eventual/when")

function reducible(source, f) {
  return convert(source, function(source, next, initial) {
    var result = f(source, function forward(result, value) {
      return next(value, result)
    }, initial)
    when(result, function ondeliver(value) {
      next(null, value)
    }, function onfailure(error) {
      next(error)
    })
  })
}

module.exports = reducible
