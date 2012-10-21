/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var accumulated = require("./accumulated")
var transform = require("./transform")


function takeWhile(source, predicate) {
  /**
  Returns a sequence of successive items from `source` while `predicate(item)`
  returns `true`. `predicate` must be free of side-effects.

  ## Example

  var digits = takeWhile([ 2, 7, 10, 23 ], function(value) {
    return value < 10
  })
  print(digits)   // => <stream 2 7 />
  **/
  return transform(source, function(next, value, state) {
    return predicate(value) ? next(value, state) :
                              next(accumulated(), state)
  })
}

module.exports = takeWhile
