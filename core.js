/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var Method = require('method')
var Box = require('./box')

var end = Box('end of the sequence')
exports.end = end

var accumulated = Box('Indicator that source has being accumulateed')
exports.accumulated = accumulated

var error = Box('error')
exports.error = error

var accumulate = Method()
exports.accumulate = accumulate

function accumulateEmpty(_, f, start) { f(end(), start) }

accumulate.define(undefined, accumulateEmpty)
accumulate.define(null, accumulateEmpty)

accumulate.define(Array, function(array, next, initial) {
  var state = initial, index = 0, count = array.length
  while (index < count) {
    state = next(array[index++], state)
    if (state && state.is === accumulated) break
  }
})

function accumulator(method) {
  return accumulate.implement({}, method)
}
exports.accumulator = accumulator

function transformer(make) {
  return accumulate.implement({}, function(self, next, initial) {
    return accumulate(make(), next, initial)
  })
}
exports.transformer = transformer

function transform(source, f) {
  return accumulator(function(self, next, initial) {
    accumulate(source, function(value, result) {
      return value && value.isBoxed ? next(value, result)
                                    : f(next, value, result)
    }, initial)
  })
}
exports.transform = transform

function filter(source, predicate) {
  /**
  Composes filtered version of given `source`, such that only items contained
  will be once on which `f(item)` was `true`.
  **/
  return transform(source, function(next, value, accumulated) {
    return predicate(value) ? next(value, accumulated) : accumulated
  })
}
exports.filter = filter

function map(source, f) {
  /**
  Composes version of given `source` where each item of source is mapped using `f`.
  **/
  return transform(source, function(next, value, accumulated) {
    return next(f(value), accumulated)
  })
}
exports.map = map

function take(source, n) {
  /**
  Composes version of given `source` containing only element up until `f(item)`
  was true.
  **/
  return transformer(function() {
    var count = n >= 0 ? n : Infinity
    return transform(source, function(next, value, result) {
      count = count - 1
      return count === 0 ? next(accumulated(), next(value, result)) :
             count > 0 ? next(value, result) :
                         next(accumulated(), result)
    })
  })
}
exports.take = take

function drop(source, n) {
  /**
  Reduces given `reducible` to a firs `n` items.
  **/
  return transformer(function() {
    var count = n >= 0 ? n : 1
    return transform(source, function(next, value, result) {
      return count -- > 0 ? result :
                            next(value, result)
    })
  })
}
exports.drop = drop

function takeWhile(source, predicate) {
  /**
  Composes version of given `source` containing only firs `n` items of it.
  **/
  return transform(source, function(next, value, state) {
    return predicate(value) ? next(value, state) :
                              next(accumulated(), state)
  })
}
exports.takeWhile = takeWhile

function dropWhile(source, predicate) {
  /**
  Reduces `reducible` further by dropping first `n`
  items to on which `f(item)` ruturns `true`
  **/
  return transformer(function() {
    var active = true
    return transform(source, function(next, value, result) {
      return active && (active = predicate(value)) ? result :
                                                     next(value, result)
    })
  })
}
exports.dropWhile = dropWhile

function tail(source) {
  return drop(source, 1)
}
exports.tail = tail

function into(source, buffer) {
  /**
  Adds items of given `reducible` into
  given `array` or a new empty one if omitted.
  **/
  var result = buffer || []
  accumulate(source, function(value) {
    if (value && value.isBoxed) return value
    result.push(value)
  })
  return result
}
exports.into = into

//console.log(into(skip(2, [ 1, 2, 3, 4, 5, 6 ])))
