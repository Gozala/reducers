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

// Define a `Signal` data-type. A signal is a sequence of "events over time".
// 
// Signals are a building block for creating Reactive event-driven programs.
// 
// If you're familiar with libraries like Node EventEmitter, you might have
// an easy time thinking of Signal as a single event channel. The key difference
// is that signal represents events-over-time as a reducible value. This means
// the events-over-time can be transformed, filtered forked and joined just like
// an array.
function Signal() {}

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
  /**
  Emit a new value for signal.
  Throws an exception if the signal is not open for emitting.
  **/
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
  /**
  Close a signal, preventing new values from being emitted.
  Throws an exception if the signal is already closed.
  **/
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

