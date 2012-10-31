"use strict";

var accumulate = require("./accumulate")
var concat = require("./concat")
var emit = require("./emit")

var queued = "queued@" + module.id
var output = "output@" + module.id

function Queue(target) {
  this[output] = target
  this[queued] = []
}

function isDrained(queue) {
  return !queue[queued]
}

function queue(target) {
  return new Queue(target)
}
queue.type = Queue
queue.emit = function(queue, value) {
  if (isDrained(queue))
    emit(queue[output], value)
  else queue[queued].push(value)
  return queue
}
queue.accumulate = function(queue, next, initial) {
  accumulate(concat(queue[queued], queue[output]), next, initial)
  queue[queued] = null
}

accumulate.define(Queue, queue.accumulate)
emit.define(Queue, queue.emit)

module.exports = queue
