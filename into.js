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
