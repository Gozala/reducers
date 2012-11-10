"use strict";

var Method = require("method")

var isReduced = require("./is-reduced")
var isError = require("./is-error")
var end = require("./end")

var Eventual = require("eventual/type")
var when = require("eventual/when")

var accumulate = Method()

// Implementation of accumulate for the empty sequences, that immediately
// signals end of sequence.
accumulate.empty = function accumulateEmpty(empty, next, initial) {
  next(end, initial)
}
// Implementation of accumulate for the singular values which are treated
// as sequences with single element. Yields the given value and signals
// the end of sequence.
accumulate.singular = function accumulateSingular(value, next, initial) {
  next(end, next(value, initial))
}

// Implementation accumulate for the array (and alike) values, such that it
// will call accumulator function `next` each time with next item and
// accumulated state until it's exhausted or `next` returns marked value
// indicating that it's done accumulating. Either way signals end to
// an accumulator.
accumulate.indexed = function accumulateIndexed(indexed, next, initial) {
  var state = initial
  var index = 0
  var count = indexed.length
  while (index < count) {
    var value = indexed[index]
    state = next(value, state)
    index = index + 1
    if (value === end) return end
    if (isError(value)) return state
    if (isReduced(state)) return state.value
  }
  next(end, state)
}

// Both `undefined` and `null` implement accumulate for empty sequences.
accumulate.define(void(0), accumulate.empty)
accumulate.define(null, accumulate.empty)

// Array and arguments implement accumulate for indexed sequences.
accumulate.define(Array, accumulate.indexed)
function Arguments() { return arguments }
Arguments.prototype = Arguments()
accumulate.define(Arguments, accumulate.indexed)

// All other built-in data structures are treated as single value sequences
// by default. Of course individual types may choose to override that.
accumulate.define(accumulate.singular)

// All eventual values are treated as a single value of sequences, of
// the value they realize to.
accumulate.define(Eventual, function(eventual, next, initial) {
  return when(eventual, function delivered(value) {
    return accumulate(value, next, initial)
  }, function failed(error) {
    next(error, initial)
    return error
  })
})

module.exports = accumulate
