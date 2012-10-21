/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var convert = require("./convert")
var accumulate = require("./accumulate")

function reductions(source, f, initial) {
  /**
  Returns `reducible` collection of the intermediate values of the reduction
  (as per reduce) of `source` by `f`, starting with `initial` value.

  ## Example

  var numbers = reductions([1, 1, 1, 1], function(accumulated, value) {
    return accumulated + value
  }, 0)
  print(numbers) // => <stream 1 2 3 4 />
  **/
  return convert(source, function(self, next, result) {
    var state = initial
    accumulate(source, function(value, result) {
      state = value && value.isBoxed ? next(value, result) : f(state, value)
      return next(state, result)
    }, result)
  })
}

module.exports = reductions
