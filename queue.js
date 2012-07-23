/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')


var core = require('./core'),
    convert = core.convert, accumulate = core.accumulate, append = core.append

var emit = require('./signal').emit

var queued = Name()
var output = Name()

function isDrained(queue) {
  return !queue[queued]
}

function queue(target) {
  var value = convert(target, queue.accumulate)
  emit.implement(value, queue.emit)
  value[output] = target
  value[queued] = []
  return value
}
queue.emit = function(queue, value) {
  if (isDrained(queue))
    emit(queue[output], value)
  else queue[queued].push(value)
  return queue
}
queue.accumulate = function(queue, next, initial) {
  accumulate(append(queue[queued], queue[output]), next, initial)
  queued = null
}

module.exports = queue
