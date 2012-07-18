/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var Name = require('name')
var Method = require('method')


var core = require('./core'),
    accumulate = core.accumulate, accumulated = core.accumulated,
    end = core.end, convert = core.convert

var channels = require('./channel'),
    channel = channels.channel, close = channels.close,
    isClosed = channels.isClosed, isOpen = channels.isOpen,
    enqueue = channels.enqueue, dispose = channels.dispose

var input = Name()
var accumulators = Name()

function update(hub) {
  if (!hub[accumulators].length && !isClosed(hub[input]))
    close(hub[input])
}

function open(hub) {
  var consumers = hub[accumulators]
  accumulate(hub[input], function distribute(value) {
    var accumulators = consumers.slice(0)
    var count = consumers.length, index = 0
    while (index < count) {
      var accumulator = accumulators[index++]
      var state = accumulator.next(value, accumulator.state)
      if (state && state.is === accumulated) {
        var position = consumers.indexOf(accumulator)
        if (position >= 0) consumers.splice(position, 1)
        accumulator.next(end(), accumulator.state)
        update(hub)
      } else {
        accumulator.state = state
      }
    }
    update(hub)
  })
}

function hub(source) {
  var value = convert(source, hub.accumulate)
  value[input] = source
  value[accumulators] = []
  return value
}
hub.accumulate = function accumulate(hub, next, initial) {
  if (isClosed(hub)) return next(end(), initial)
  hub[accumulators].push({ next: next, state: initial })
  if (!isOpen(hub)) open(hub)
}
module.exports = hub
