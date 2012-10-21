/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var convert = require("./convert")
var accumulate = require("./accumulate")
var concat = require("./concat")
var end = require("./end")
var hub = require('./hub')

var cached = "cached@" + module.id
var input = "input@" + module.id

function isBuffering(cache) {
  return cache[cached] !== null
}

function buffer(cache) {
  var source = cache[input]
  var buffered = []
  cache[cached] = concat(buffered, source)
  accumulate(source, function(value) {
    buffered.push(value)
    // If source is ended remove reference to the input
    // and replace internal cache with a simple buffered array.
    if (value && value.is === end) {
      cache[input] = null
      cache[cached] = buffered
    }
  })
}

function cache(source) {
  var self = convert(source, cache.accumulate)
  self[input] = hub(source)
  self[cached] = null
  return self
}
cache.accumulate = function(cache, next, initial) {
  // If input is not being buffered start buffering.
  if (!isBuffering(cache)) buffer(cache)
  // Forward all cached and upcoming values to a consumer.
  accumulate(cache[cached], next, initial)
}

module.exports = cache
