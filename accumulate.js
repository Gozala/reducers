"use strict";

var Method = require("method")
var isReduced = require("./is-reduced")
var Eventual = require("eventual/type")
var when = require("eventual/when")

var accumulate = Method()

// Implementation of accumulate for the empty sequences, that immediately
// signals end of sequence.
accumulate.empty = function accumulateEmpty(empty, next, start) {
  next(null, start)
}
// Implementation of accumulate for the singular values which are treated
// as sequences with single element. Yields the given value and signals
// the end of sequence.
accumulate.singular = function accumulateSingular(value, next, start) {
  next(null, next(value, start))
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
    var value = indexed[index++]
    if (value === null) break
    state = next(value, state)
    if (isReduced(state)) break
  }
  next(null, state)
}

// Both `undefined` and `null` implement accumulate for empty sequences.
accumulate.define(void(0), accumulate.empty)
accumulate.define(null, accumulate.empty)

// Array and arguments implement accumulate for indexed sequences.
accumulate.define(Array, accumulate.indexed)
accumulate.define((function() { return arguments })(), accumulate.indexed)

// All other built-in data structures are treated as single value sequences
// by default. Of course individual types may choose to override that.
accumulate.define(accumulate.singular)

// All eventual values are treated as a single value of sequences, of
// the value they realize to.
accumulate.define(Eventual, function(eventual, next, initial) {
  return when(eventual, function delivered(value) {
    return accumulate(value, next, initial)
  }, function failed(error) {
    next(null, next(error, initial))
    return error
  })
})

module.exports = accumulate
