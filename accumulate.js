/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Method = require("method")
var end = require("./end")
var accumulated = require("./accumulated")
var Eventual = require("eventual/type")
var when = require("eventual/when")
var error = require("./error")

var accumulate = Method()

// Implementation of accumulate for the empty sequences, that immediately
// signals end of sequence.
accumulate.empty = function accumulateEmpty(empty, next, start) {
  next(end(), start)
}
// Implementation of accumulate for the singular values which are treated
// as sequences with single element. Yields the given value and signals
// the end of sequence.
accumulate.singular = function accumulateSingular(value, next, start) {
  next(end(), next(value, start))
}
// Implementation accumulate for the array (and alike) values, such that it
// will call accumulator function `next` each time with next item and
// accumulated state until it's exhausted or `next` returns marked value
// indicating that it's done accumulating. Either way signals end to
// an accumulator.
accumulate.indexed = function accumulateIndexed(indexed, next, initial) {
  var state = initial, index = 0, count = indexed.length
  while (index < count) {
    state = next(indexed[index++], state)
    if (state && state.is === accumulated) break
  }
  next(end(), state)
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
  }, function failed(failure) {
    next(end(), next(error(failure), initial))
  })
})

module.exports = accumulate
