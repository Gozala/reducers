/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")

var queued = "queued@" + module.id
var input = "input@" + module.id
var forward = "forward@" + module.id
var state = "state@" + module.id

function drain(buffer, next, result) {
  var values = buffer[queued]
  while (values.length) result = next(values.shift(), result)
  buffer[queued] = null
  return result
}

function isDrained(buffer) {
  return buffer[queued] === null
}

function buffer(source) {
  /**
  Buffer a reducible, saving items from reducible in-memory until a consumer
  reduces the buffer.

  Reducibles are not required to expose a data container for the sequence they
  represent, meaning items in the reducible may not be represented in-memory
  at all. This is great for representing potentially infinite data structures
  like "mouse clicks over time", or "data streamed from server". However,
  sometimes it's important to reduce all items in the reducible, even if the
  item was emitted at a point in the past. This is where buffer comes in handy.
  It stores a backlog of previously emitted items in-memory until you're
  ready to consume.
  **/
  var self = convert(source, buffer.accumulate)
  self[state] = null
  self[input] = source
  self[queued] = []
  self[forward] = function(value) {
    self[queued].push(value)
  }
  accumulate(source, function(value) {
    self[state] = self[forward](value, self[state])
  })
  return self
}
buffer.accumulate = function(buffer, next, initial) {
  // If buffer has already been drained accumulate from the original source.
  if (isDrained(buffer)) return accumulate(buffer[input], next, initial)
  // Otherwise, drain the buffer, passing items to the accumulating function.
  buffer[state] = drain(buffer, next, initial)
  // Overshadow forward function, insuring that
  // future values are not buffered, and are instead passed directly to the
  // accumulation function.
  buffer[forward] = next
  return buffer
}

module.exports = buffer
