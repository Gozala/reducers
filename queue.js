/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')
var core = require('./core'),
    reduce = core.reduce, reduced = core.reduced
var eventuals = require('eventual/eventual'),
    defer = eventuals.defer, deliver = eventuals.deliver

var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)


// Method to enqueue values.
var enqueue = Method()
exports.enqueue = enqueue

// Method to close a queue.
var close = Method()
exports.close = close

var isClosed = Method()
exports.isClosed = isClosed

var react = Method()
exports.react = react

var state = Name()
var result = Name()
var next = Name()
var queued = Name()

function Queue() {}
isClosed.define(Queue, function(queue) {
  return !queue.result
})
close.define(Queue, function(queue) {
  if (!isClosed(queue)) {
    var value = queue[state]
    value = value && value.is === reduced ? value.value : value
    deliver(queue[result], value)
    queue[next] = queue[state] = queue[result] = queue[queued] = null
  }
  return queue
})
react.define(Queue, function(queue) {
  var values = queue[queued], f = queue[next]
  while (values.length && f) {
    queue[state] = f(queue[state], values.shift())
    if (is(queued[state], reduced))
      return close(queue)
  }
})
enqueue.define(Queue, function(queue, item) {
  if (!isClosed(queue)) {
    queue[queued].push(item)
    react(queue)
  }
  return queue
})
reduce.define(Queue, function(queue, f, start) {
  if (isClosed(queue)) return start
  queue[state] = start
  queue[next] = f
  react(queue)
  return queue[result]
})

function queue() {
  var result = new Queue()
  result[queued] = slice(arguments)
  result[result] = defer()
  result[state] = null
  result[next] = null
  return result
}
exports.queue = queue
