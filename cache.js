"use strict";

var buffer = require("./buffer")
var reducible = require("./reducible")
var reduce = require("./reduce")

function cache(input) {
  var result
  return reducible(function(next, initial) {
    return result ? reduce(result, next, initial) :
                    reduce(result = buffer(input), next, initial)
  })
}

module.exports = cache
