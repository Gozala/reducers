/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var protocol = require('protocol/core').protocol
var reducers = require('./core'),
    Reducible = reducers.Reducible, reduced = reducers.reduced,
    is = reducers.is, reduce = reducers.reduce, reducible = reducers.reducible
var eventuals = require('eventual/core'),
    defer = eventuals.defer, go = eventuals.go, realize = eventuals.realize,
    then = eventuals.then, Deferred = eventuals.Deferred,
    eventual = eventuals.eventual
var ego = require('alter-ego/core'),
    define = ego.define, record = ego.record, over = ego.over, extend = ego.extend
var queue = require('./queue'),
    Queueable = queue.Queueable, enqueue = queue.enqueue,
    Closable = queue.Closable, close = queue.close,
    closed = queue.closed, Reactor = queue.Reactor,
    react = queue.react
var buffer = require('./buffer').buffer
var Hub = require('./hub').Hub

var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

function identity(value) { return value }

// Implement `reduce` for eventual values, that way reduce can
// be delayed until it's realized.
define(
  over, Deferred,
  Reducible, {
    reduce: eventual(function reduce(f, reducible, start) {
      return reduce(f, reducible, start)
    })
  })

Closable({
  close: function(closable) {
    return closable
  }
})

var Channel = define(
  extend, Hub,
  record, [ 'source', 'reducers', 'result' ],
  Queueable, {
    enqueue: function(channel, value) {
      if (!closed(channel)) enqueue(channel.source, value)
      return channel
    }
  })


function channel(meta) {
  /**
  Channel creates new `reducible` where new items can be queued using
  `enqueue(my.channel, item)`. Channel also can be closed `close(my.channel)`.
  Channel can be reduced simultaneously by multiple consumers. Once all
  consumers are done reducing channel it's closed (This is in a sense similar
  to how nodejs quits once there's no task is left in a queue). All items are
  enqueued up until first consumption.
  **/
  return new Channel(buffer(), [], null,  meta)
}
exports.channel = channel
exports.Channel = Channel
exports.enqueue = enqueue
exports.close = close
exports.closed = closed
exports.reduce = reduce


function sequential(channel) {
  return reducible(function(next, start) {
    return reduce(eventual(next), channel, start)
  })
}
exports.sequential = sequential

function parallel(channel) {
  return reducible(function(next, start) {
    return reduce(next, channel, start)
  }, channel)
}
exports.parallel = parallel

});
