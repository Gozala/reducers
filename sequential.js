/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var reducible = require("./reducible")
var reduce = require("./reduce")
var eventual = require("eventual/decorate")

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
  return reducible(source, function(_, next, initial) {
    return reduce(source, eventual(function(result, value) {
      return next(result, value)
    }), initial)
  })
}

module.exports = sequential
