"use strict";

var accumulate = require("./accumulate")
var reducible = require("./reducible")
var isError = require("./is-error")
var end = require("./end")

// THIS IS EXPERIMENTAL FUNCTION THAT MY GO AWAY IN A FUTURE

function adjust(source, f, initial) {
  /**
  Function takes reducible `source`, `f` transformer function and `initial`
  state. Adapted version of `source` is returned in result. `f` is called with
  each item of the source and curried state and is expected to return array
  of adjusted item and new state (which will be curried to next call) pair.

  ## Example

  var delimiterChar = ' '
  var data = [ 'Bite my', ' shiny, metal ', 'ass!' ]
  var chunks = adjust(data, function(chunk, prefix) {
    var text = prefix + chunk
    var delimiterIndex = text.lastIndexOf(delimiterChar)
    var splitIndex = delimiterIndex >= 0 ? delimiterIndex : text.length
    var capturedChunk = text.substr(0, splitIndex)
    var curriedChunk = text.substr(splitIndex + 1)
    return [ capturedChunk, curriedChunk ]
  }, '')
  var words = expand(chunks, function(chunk) {
    return chunk.split(delimiterChar)
  })

  // => [ 'Bite', 'my', 'shiny', 'metal', 'ass!' ]
  **/
  return reducible(source, function(next, result) {
    var state = initial
    accumulate(source, function(value, result) {
      // If value is either end of stream (null) or an error skip
      // `f` transformer, just propagate.
      if (value === end || isError(value)) return next(value, result)
      var pair = f(value, state)
      state = pair[1]
      return next(pair[0], result)
    }, result)
  })
}

module.exports = adjust
