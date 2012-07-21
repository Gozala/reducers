/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')
var Box = require('./box')
var core = require('./core'),
    accumulate = core.accumulate, end = core.end, error = core.error,
    convert = core.convert, map = core.map

var eventuals = require('eventual/eventual'),
    defer = eventuals.defer, deliver = eventuals.deliver, when = eventuals.when

function reduce(source, f, state) {
  var promise = defer()
  accumulate(source, function(value) {
    if (value && value.isBoxed) {
      if (value.is === end) deliver(promise, state)
      if (value.is === error) deliver(promise, value.value)
      return value
    } else {
      state = f(state, value)
      return state
    }
  }, state)
  return when(promise)
}
exports.reduce = reduce

function reducible(source, f) {
  return convert(source, function(source, next, initial) {
    var result = f(source, function forward(result, value) {
      return next(value, result)
    }, initial)
    when(result, function(value) { next(end(), value) })
  })
}

// console.log(into(join([ 1, 2 ], [ 3 ], [ 3, 5 ])))

function flatten(source) {
  /**
  Flattens given `reducible` collection of `reducible`s
  to a `reducible` with items of nested `reducibles`.
  **/
  return reducible(source, function(_, next, initial) {
    return reduce(source, function(result, nested) {
      return reduce(nested, function(result, value) {
        return next(result, value)
      }, result)
    }, initial)
  })
}
exports.flatten = flatten

// console.log(into(flatten([ [1, 2], [ 3, 4 ], [], [ 7, 8 ] ])))

function expand(source, f) {
  return flatten(map(source, f))
}
exports.expand = expand

/*
console.log(into(expand(function(x) {
  return [ x, x * x ]
}, [ 1, 2, 3 ])))
*/


function into(source, buffer) {
  /**
  Adds items of given `reducible` into
  given `array` or a new empty one if omitted.
  **/
  return reduce(source, function(result, value) {
    result.push(value)
    return result
  }, buffer || [])
}
exports.into = into
