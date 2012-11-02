"use strict";

var buffer = require("./buffer")
var reducible = require("./reducible")
var accumulate = require("./accumulate")

function cache(input) {
  var result
  return reducible(function(next, initial) {
    return result ? accumulate(result, next, initial) :
                    accumulate(result = buffer(input), next, initial)
  })
}

module.exports = cache
