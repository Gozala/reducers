"use strict";

var concat = require("./concat")
var hub = require("./hub")
var reducible = require("./reducible")
var reduce = require("./reduce")
var accumulate = require("./accumulate")

function push(value, array) {
  array.push(value)
  return array
}

function buffer(input) {
  /**
  Function takes `input` sequence and returns equivalent sequence but buffered.
  So if `input` stream represents result of expensive computation it can be
  buffered to do it only once. Also note that `buffer` is not lazy, it will
  start buffering `input` immediately. For lazy buffering use `cache` instead.
  **/

  // Wrap `input` into the hub, just to be sure that it can be consumed
  // by multiple sources.
  var source = hub(input)
  // Create an array of already buffered values and accumulate source in it.
  var buffered = []
  accumulate(source, push, buffered)
  // Result is a concatenation of buffered values with rest of the source.
  var result = concat(buffered, source)
  return reducible(function reduceReducible(next, initial) {
    // If end of stream `null` is already in a buffer, then just reduce it,
    // otherwise reduce concatenation of buffered values and rest of the source.
    return buffered.indexOf(null) >= 0 ? reduce(buffered, next, initial)
                                       : reduce(result, next, initial)
  })
}

module.exports = buffer
