"use strict";

var convert = require("./convert")
var accumulate = require("./accumulate")
var concat = require("./concat")
var emit = require("./emit")

var queued = "queued@" + module.id
var output = "output@" + module.id

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
  accumulate(concat(queue[queued], queue[output]), next, initial)
  queued = null
}

module.exports = queue
