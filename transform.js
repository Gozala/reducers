"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")

function transform(source, f) {
  /**
  Function takes `source` sequence and an `f` function, which is used to
  intercept each non-boxed item of the sequence. It is invoked with `next`
  continuation function, sequence `value` being yielded and accumulated
  `result`. `f` is supposed to call `next` with a intercepted `value` and
  `result`.

  This enables writing transformation functions that don't deal with
  back-channel in form of boxed values. In other words transformation
  functions like `filter` and `map` just intercept values but they don't
  change size of sequence or handle errors there for they want to bypass
  back-channel by using transform`.

  For examples of use see `map`, `filter` etc... Some functions that want
  to change size of sequence should use `transformer` instead, for examples
  of those see `take`, `takeWhile`.
  **/
  return convert(source, function(self, next, initial) {
    accumulate(source, function(value, result) {
      return value === null ? next(null, result) :
             value && value.isBoxed ? next(value, result) :
                                      f(next, value, result)
    }, initial)
  })
}

module.exports = transform
