/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

"use strict";

var reduce = require("./reduce")

function into(source, buffer) {
  /**
  Adds items of given `reducible` into
  given `array` or a new empty one if omitted.
  **/
  return reduce(source, function(result, value) {
    result.push(value)
    return result
  }, buffer || [])
}

module.exports = into
