"use strict";

var emit = require("./emit")
var close = require("./close")
var end = require("./end")
var accumulate = require("./accumulate")

function pipe(input, output) {
  /**
  Takes `input` sequence and pipes it to the `output` (which is a channel,
  signal or anything that implements `emit`). Note that first end of sequence
  from the piped `input`-s will end an `output` causing subsequent emits to
  fail. If you need to pipe multiple inputs do `pipe(flatten(multiple), output)`
  that way output will close on last end. If you can't flatten all the inputs
  you'll be piping then you can create a signal and pipe flattened version of
  it. That way emitting new input on that channel will automatically pipe all
  it's items into output.
  **/
  accumulate(input, function(value, result) {
    // If signal / channel is closed `accumulated` box is returned
    // that will notify input that consumer is done consuming.
    return value && value.is === end ? close(output, value.value) :
                                       emit(output, value)
  })
}

module.exports = pipe
