/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var transform = require("./transform")

function filter(source, predicate) {
  /**
  Composes filtered version of given `source`, such that only items contained
  will be once on which `f(item)` was `true`.

  ## Example

  var digits = filter([ 10, 23, 2, 7, 17 ], function(value) {
    return value >= 0 && value <= 9
  })
  print(digits) // => <stream 2 7 />
  **/
  return transform(source, function(next, value, accumulated) {
    return predicate(value) ? next(value, accumulated) : accumulated
  })
}

module.exports = filter
