"use strict";

var reducible = require("./reducible")
var accumulate = require("./accumulate")
var reduce = require("./reduce")
var eventual = require("eventual/decorate")
var when = require("eventual/when")
var end = require("./end")

function sequential(source) {
  /**
  Takes `source` sequence and returns decorated version which intercepts
  into reduction such that any transformation on the result will have
  guaranteed sequential order. This decorator is useful with functions
  like `flatten` and `expand` when order of items in resulting sequences
  is desired to be index based rather then time based. Note that this
  will buffer items that are delivered earlier then their order so keep
  that in mind and use it with extra care.
  **/
  return reducible(function reduceReducible(next, initial) {
    var result = reduce(source, eventual(function(value, result) {
      return next(result, value)
    }), initial)
    when(result, function(result) { next(end, result) }, next)
  })
}

module.exports = sequential
