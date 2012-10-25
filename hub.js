"use strict";

var accumulate = require("./accumulate")
var convert = require("./convert")
var accumulated = require("./accumulated")
var end = require("./end")

var input = "input@" + module.id
var consumers = "consumers@" + module.id

function open(hub) {
  var source = hub[input]
  var hubConsumers = hub[consumers]
  hub[input] = null         // mark hub as open
  accumulate(source, function distribute(value) {
    var activeConsumers = hubConsumers.slice(0)
    var count = activeConsumers.length, index = 0
    while (index < count) {
      var consumer = activeConsumers[index++]
      var state = consumer.next(value, consumer.state)
      if (state && state.is === accumulated) {
        var position = hubConsumers.indexOf(consumer)
        if (position >= 0) hubConsumers.splice(position, 1)
        consumer.next(end(), consumer.state)
      } else {
        consumer.state = state
      }
    }

    if (value && value.is === end) {
      hubConsumers.splice(0)
      hub[input] = source
    }
    if (!hubConsumers.length) {
      hub[input] = source       // mark hub as not open.
      return accumulated()      // will notify source consumption is complete.
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
  hub[consumers].push({ next: next, state: initial })
  if (!isOpen(hub)) open(hub)
}
module.exports = hub
