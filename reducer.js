"use strict";

var accumulate = require("./accumulate")
var reducible = require("./reducible")
var isError = require("./is-error")


function reducer(process) {
  return function reducer(source, options) {
    return reducible(function(next, initial) {
      accumulate(source, function(value, result) {
        return isError(value) ? next(value, result) :
               process(options, next, value, result)
      })
    })
  }
}

module.exports = reducer
