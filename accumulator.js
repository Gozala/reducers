/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')
var Box = require('./box')
var eventuals = require('eventual/eventual'),
    defer = eventuals.defer, deliver = eventuals.deliver

var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

var end = Box('end of the sequence')
var accumulateed = Box('Indicator that source has being accumulateed')
var error = Box('error')

var accumulate = Method()
exports.accumulate = accumulate

var enqueue = Method()
exports.enqueue = enqueue

var dispose = Method()
exports.dispose = dispose

var close = Method()
exports.close = close

var accumulateor = Name()
var state = Name()

function Channel() {}
accumulate.define(Channel, function(channel, next, initial) {
  channel[accumulateor] = next
  channel[state] = initial
})
dispose.define(Channel, function(channel) {
  channel[accumulateor] = null
  channel[state] = null
})
enqueue.define(Channel, function(channel, value) {
  var result = channel[accumulateor](value, channel[state])
  channel[state] = result
  if (result && result.is === accumulateed)
    dispose(channel)
})
close.define(Channel, function(channel, value) {
  if (value !== undefined) enqueue(channel, value)
  var result = channel[state]
  var next = channel[accumulateor]
  dispose(channel)
  next(end(), result)
})

function channel() { return new Channel() }
exports.channel = channel

function reduce(source, f, start) {
  var promise = defer()
  accumulate(source, function(value, result) {
    return value && value.is === end ? deliver(promise, result)
                                     : f(result, value)
  }, start)
  return promise
}
exports.reduce = reduce

function tranform(source, f) {
  return accumulate.implement({}, function(self, next, initial) {
    accumulate(source, function(value, result) {
      return value && value.isBoxed ? next(value, result)
                                    : f(next, value, result)
    }, initial)
  })
}
exports.tranform = tranform

function filter(source, f) {
  return tranform(source, function(next, value, result) {
    return f(value) ? next(value, result) : result
  })
}
exports.filter = filter

function map(source, f) {
  return tranform(source, function(next, value, result) {
    return next(f(value), result)
  })
}
exports.map = map

function generator(generate) {
  return accumulate.implement({}, function(self, next, initial) {
    var state = initial
    generate(function(value) {
      state = next(value, state)
      return state
    })
  })
}
exports.generator = generator
