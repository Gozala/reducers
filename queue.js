/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')


var core = require('./core'),
    convert = core.convert, accumulate = core.accumulate

var channels = require('./channel'),
    isClosed = channels.isClosed, isOpen = channels.isOpen,
    enqueue = channels.enqueue, dispose = channels.dispose,
    close = channels.close

var queued = Name()
var output = Name()

function drain(queue) {
  var values = queue[queued]
  while (values.length) enqueue(queue[output], values.shift())
  queue[queued] = null
  return queue
}

function isDrained(queue) {
  return isOpen(queue) && !queue[queued]
}

function queue(target) {
  var value = convert(target, queue.accumulate)
  enqueue.implement(value, queue.enqueue)
  value[output] = target
  value[queued] = []
  return value
}
queue.enqueue = function(queue, value) {
  if (isDrained(queue))
    enqueue(queue[output], value)
  else queue[queued].push(value)
  return queue
}
queue.accumulate = function(queue, next, initial) {
  var opened = isOpen(queue)
  accumulate(queue[output], next, initial)
  if (!opened) drain(queue)
  return queue
}
queue.close = function(queue, value) {
  if (value !== undefined) enqueue(queue, value)
  return close(queue[output])
}

module.exports = queue
