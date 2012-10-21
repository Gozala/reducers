/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")

function transformer(source, transform) {
  /**
  Takes a `source` sequence and a transforming function. Returns a new sequence
  that represents the original sequence transformed by `transform`. However,
  the transformation of the source is deferred until you actually reduce the
  returned sequence. It is sort of equivalent to function composition:

  reduce(transformer(source, transform), f, start) => reduce(transform(source), f, start)
  **/
  return convert(source, function(self, next, initial) {
    return accumulate(transform(source), next, initial)
  })
}
module.exports = transformer
