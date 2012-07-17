/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Name = require('name')
var Method = require('method')
var Box = require('./box')
var core = require('./core'),
    accumulate = core.accumulate, end = core.end,
    accumulator = core.accumulator, map = core.map

var eventuals = require('eventual/eventual'),
    defer = eventuals.defer, deliver = eventuals.deliver

// Define a shortcut for `Array.prototype.slice.call`.
var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)


function reduce(source, f, start) {
  var promise = defer()
  accumulate(source, function(value, result) {
    if (value && value.isBoxed) {
      if (value.is === end) deliver(promise, result)
      return value
    } else {
      return f(result, value)
    }
  }, start)
  return promise
}
exports.reduce = reduce

function reducible(f) {
  return accumulator(function(source, next, initial) {
    return f(source, function forward(result, value) {
      return next(value, result)
    }, initial)
  })
}

function append(left, right) {
  /**
  Joins given `reducible`s into `reducible` of items
  of all the `reducibles` preserving an order of items.
  **/
  return flatten(slice(arguments))
}
exports.append = append

// console.log(into(join([ 1, 2 ], [ 3 ], [ 3, 5 ])))

function flatten(source) {
  /**
  Flattens given `reducible` collection of `reducible`s
  to a `reducible` with items of nested `reducibles`.
  **/
  return reducible(function(_, next, initial) {
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

function generator(generate) {
  return accumulator(function(self, next, initial) {
    var state = initial
    generate(function(value) {
      state = next(value, state)
      return state
    })
  })
}
exports.generator = generator
