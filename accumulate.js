/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Method = require("method")
var end = require("./end")
var accumulated = require("./accumulated")

var accumulate = Method()

// Implementation of accumulate for the empty sequences.
function accumulateEmpty(_, f, start) { f(end(), start) }

// Both undefined and null are treated as empty collections,
// so the reduce accordingly.
accumulate.define(void(0), accumulateEmpty)
accumulate.define(null, accumulateEmpty)

// All other data structures that do not implement `accumulate`
// for their type are treated as sequences of single value.
accumulate.define(function(value, next, start) {
  next(end(), next(value, start))
})

// Unlike all other data built-in data structures in JS Arrays, do
// represent sequences, there for they implement `accumulate` differently.
accumulate.define(Array, function(array, next, initial) {
  var state = initial, index = 0, count = array.length
  while (index < count) {
    state = next(array[index++], state)
    if (state && state.is === accumulated) break
  }
  next(end(), state)
})

module.exports = accumulate
