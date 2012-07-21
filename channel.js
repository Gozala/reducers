/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')

var core = require('./core'),
    accumulate = core.accumulate,
    accumulated = core.accumulated, end = core.end

var enqueue = Method()
exports.enqueue = enqueue

var close = Method()
exports.close = close

var accumulator = Name()
var state = Name()
var closed = Name()

function isClosed(channel) {
  return !!channel[closed]
}
function isOpen(channel) {
  return !!channel[accumulator]
}

function Channel() {}
accumulate.define(Channel, function(channel, next, initial) {
  if (isOpen(channel)) throw Error('Channel is being consumed')
  if (isClosed(channel)) return next(end(), initial)
  channel[accumulator] = next
  channel[state] = initial
  return channel
})
enqueue.define(Channel, function(channel, value) {
  if (isClosed(channel)) throw Error('Channel is already closed')
  if (!isOpen(channel)) throw Error('Channel is not open')
  var result = channel[accumulator](value, channel[state])
  if (result && result.is === accumulated) {
    close(channel)
  } else {
    channel[state] = result
  }
  return channel
})
close.define(Channel, function(channel, value) {
  if (isClosed(channel)) throw Error('Channel is already closed')
  if (value !== undefined) enqueue(channel, value)
  var result = channel[state]
  var next = channel[accumulator]
  channel[closed] = true
  channel[accumulator] = null
  channel[state] = null
  next(end(), result)

  return channel
})

function channel() { return new Channel() }
channel.isOpen = isOpen
channel.isClosed = isClosed
exports.channel = channel
