/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')

var core = require('./core'),
    accumulate = core.accumulate, accumulated = core.accumulated, end = core.end

var enqueue = Method()
exports.enqueue = enqueue

var dispose = Method()
exports.dispose = dispose

var close = Method()
exports.close = close

var isClosed = Method()
exports.isClosed = isClosed

var isOpen = Method()
exports.isOpen = isOpen

function channel() { return new Channel() }
exports.channel = channel

var accumulator = Name()
var state = Name()
var consumed = Name()
var opened = Name()
var closed = Name()

function Channel() {
  /**
  Creates new channel.
  **/
  this[opened] = false
  this[closed] = false
}
isClosed.define(Channel, function(channel) {
  return channel[closed]
})
isOpen.define(Channel, function(channel) {
  return channel[opened]
})
accumulate.define(Channel, function(channel, next, initial) {
  if (isOpen(channel)) throw Error('Channel is consumed')
  channel[opened] = true
  channel[accumulator] = next
  channel[state] = initial
  return channel
})
dispose.define(Channel, function(channel) {
  channel[closed] = true
  channel[accumulator] = null
  channel[state] = null
  return channel
})
enqueue.define(Channel, function(channel, value) {
  if (isClosed(channel)) throw Error('Channel is closed')
  var result = channel[accumulator](value, channel[state])
  if (result && result.is === accumulated) {
    channel[accumulator](end(), channel[state])
    dispose(channel)
  } else {
    channel[state] = result
  }
  return channel
})
close.define(Channel, function(channel, value) {
  if (isClosed(channel)) throw Error('Channel is closed')
  if (value !== undefined) enqueue(channel, value)
  var result = channel[state]
  var next = channel[accumulator]
  dispose(channel)
  next(end(), result)
  return channel
})
