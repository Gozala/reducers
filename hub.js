"use strict";

var accumulate = require("./accumulate")
var convert = require("./convert")
var accumulated = require("./accumulated")
var end = require("./end")

var input = "input@" + module.id
var consumers = "consumers@" + module.id

function close(consumers, end) {
  while (consumers.length) {
    var count = consumers.length
    var index = 0
    while (index < count) {
      var consumer = consumers[index]
      consumer.next(end, consumer.state)
      index = index + 1
    }
    consumers.splice(0, count)
  }
}

function dispatch(consumers, value) {
  var count = consumers.length
  var index = 0
  while (index < count) {
    var consumer = consumers[index]
    var state = consumer.next(value, consumer.state)
    // If consumer has finished accumulation remove it from the consumers
    // list. And dispatch end of stream on it (maybe that should not be
    // necessary).
    if (state && state.is === accumulated) {
      consumers.splice(index, 1)
      consumer.next(end(), state.value)
      // If consumer is removed than we decrease count as consumers array
      // will contain less elements (unless of course more elements were
      // added but we would like to ignore those).
      count = count - 1
    } else {
      consumer.state = state
      index = index + 1
    }
  }
}

function open(hub) {
  var source = hub[input]
  var reducers = hub[consumers]
  hub[input] = null         // mark hub as open
  accumulate(source, function distribute(value) {
    // If it's end of the source we close all the reducers including
    // ones that subscribe as side effect.
    if (value && value.is === end) close(reducers, value)
    // otherwise we dispatch value to all the registered reducers.
    else dispatch(reducers, value)

    // reducers will be empty if either source is drained or if all the
    // reducers finished reductions. Either way we reset input back to
    // source and return `accumulated` marker to stop the reduction of
    // source.
    if (reducers.length === 0) {
      hub[input] = source
      return accumulated()
    }
  })
}

function isHub(value) {
  return !value || (input in value && consumers in value)
}

function isOpen(hub) {
  return hub[input] === null
}

function hub(source) {
  /**
  Take a reducible `source`, such as a `signal` and return a reducible that can
  be consumed by many reducers.
  **/

  // If source is already a hub avoid just return.
  if (isHub(source)) return source
  var value = convert(source, hub.accumulate)
  value[input] = source
  value[consumers] = []
  return value
}
hub.isHub = isHub
hub.isOpen = isOpen
hub.accumulate = function accumulate(hub, next, initial) {
  // Enqueue new consumer into consumers array so that new
  // values will be delegated to it.
  hub[consumers].push({ next: next, state: initial })
  // If source is not in the process of consumption than
  // start it up.
  if (!isOpen(hub)) open(hub)
}
module.exports = hub
