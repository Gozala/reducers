/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')

var core = require('./core'),
    accumulate = core.accumulate,
    accumulated = core.accumulated, end = core.end

var emit = Method()

var close = Method()

var accumulator = Name()
var state = Name()
var closed = Name()

// Signals can be either open or closed. An open signal may `emit` new values.
// A signal that is not open may not emit.
// 
// Define helper that allow you to test the state of a signal.
function isClosed(signal) {
  return !!signal[closed]
}
function isOpen(signal) {
  return !!signal[accumulator]
}

function Signal() {}

// Implement accumulate protocol on signals, making them reducible.
accumulate.define(Signal, function(signal, next, initial) {
  // Signals may only be reduced by one consumer function.
  // Other data types built on top of signal may allow for more consumers.
  if (isOpen(signal)) throw Error('Signal is being consumed')
  if (isClosed(signal)) return next(end(), initial)
  signal[accumulator] = next
  signal[state] = initial
  return signal
})

emit.define(Signal, function(signal, value) {
  if (isClosed(signal)) throw Error('Signal is already closed')
  if (!isOpen(signal)) throw Error('Signal is not open')
  var result = signal[accumulator](value, signal[state])
  if (result && result.is === accumulated) {
    close(signal)
  } else {
    signal[state] = result
  }
  return signal
})

close.define(Signal, function(signal, value) {
  if (isClosed(signal)) throw Error('Signal is already closed')
  if (value !== undefined) emit(signal, value)
  var result = signal[state]
  var next = signal[accumulator]
  signal[closed] = true
  signal[accumulator] = null
  signal[state] = null
  next(end(), result)

  return signal
})

// Define a factory function for the `Signal` constructor.
// Assign other signal functions to the factory function object and export
// the result.
function signal() { return new Signal() }
signal.type = Signal
signal.isOpen = isOpen
signal.isClosed = isClosed
signal.emit = emit
signal.close = close

module.exports = signal

