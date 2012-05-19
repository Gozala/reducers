/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true latedef: false supernew: true */
/*global define: true */

;(function(id, factory) { // Module boilerplate :(
  if (typeof(define) === 'function') { // RequireJS
    define(factory);
  } else if (typeof(require) === 'function') { // CommonJS
    factory.call(this, require, exports, module);
  } else if (~String(this).indexOf('BackstagePass')) { // JSM
    factory(function require(uri) {
      var imports = {};
      Cu.import(uri, imports);
      return imports;
    }, this, { uri: __URI__, id: id });
    exports.EXPORTED_SYMBOLS = Object.keys(exports);
  } else {  // Browser or alike
    factory(function require(id) {
      return globals[id];
    }, (this[id] = {}), { uri: document.location.href + '#' + id, id: id });
  }
}).call(this, 'reducers', function(require, exports, module) {

'use strict';

var protocol = require('protocol/core').protocol
var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

var Reducible = protocol({
  reduce: [ Function, protocol, Object ]
})
exports.Reducible = Reducible
var reduce = Reducible.reduce
exports.reduce = reduce

Reducible({
  reduce: function(f, reducible, start) {
    return reducible.reduce(f, start)
  }
})
Reducible(Array, {
  reduce: function reduce(f, array, start) {
    var result = start, index = 0, count = array.length
    while (index < count) {
      result = f(result, array[index++])
    }
    return f(result, end)
  }
})

var end = []
exports.end = end

function reducible(reduce) {
  return { reduce: reduce }
}
exports.reducible = reducible

function reducer(process) {
  return function reductor(f, items) {
    return reducible(function(next, start) {
      return reduce(function(result, item) {
        var value = process(f, item)
        return value === undefined ? result : next(result, value)
      }, items, start)
    })
  }
}
exports.reducer = reducer

var filter = reducer(function(f, item) {
  /**
  Returns further reduced `reducible` to an
  items to which `f(item)` returns `true`
  **/
  if (f(item)) return item
})
exports.filter = filter
  
var map = reducer(function(f, item) {
  /**
  Returns `reducible` with each item mapped
  mapped as `f(item)`.
  **/
  return f(item)
})
exports.map = map

var take = reducer(function take(f, item) {
  /**
  Reduces given `reducible` to first `n` items to
  on which `f(item)` is `true`.
  **/
  return f(item) ? item : end
})
exports.take = take

function pick(n, reducible) {
  /**
  Reduces given `reducible` to a firs `n` items.
  **/
  var count = n
  return take(function() {
    return count -- > 0
  }, reducible)
}
exports.pick = pick

function drop(f, reducible) {
  /**
  Reduces `reducible` further by dropping first `n`
  items to on which `f(item)` ruturns `true`
  **/
  var keep = false
  return filter(function(item) {
    keep = keep || !f(item)
    if (keep) return item
  }, reducible)
}
exports.drop = drop

function skip(n, reducible) {
  /**
  Reduces given `reducible` further by excluding first
  `n` items.
  **/
  var count = n
  return drop(function() {
    return count -- > 0
  }, reducible)
}
exports.skip = skip  

function into(reducible, array) {
 /**
 Adds items of given `reducible` into
 given `array` or a new empty one if omitted.
 **/
  return reduce(function(result, item) {
    if (item !== end) result.push(item)
    return result
  }, reducible, array || [])
}
exports.into = into

//console.log(into(skip(2, [ 1, 2, 3, 4, 5, 6 ])))


function flatten(source) {
  /**
  Flattens given `reducible` collection of `reducible`s
  to a `reducible` with items of nested `reducibles`.
  **/
  return reducible(function(next, start) {
    return reduce(function(result, items) {
      return reduce(function(result, item) {
        return next(result, item)
      }, items, result)
    }, source, start)
  })
}
exports.flatten = flatten

function join() {
  /**
  Joins given `reducible`s into `reducible` of items
  of all the `reducibles` preserving an order of items.
  **/
  return flatten(slice(arguments))
}
exports.join = join

//console.log(into(join([ 1, 2 ], [ 3 ], [ 3, 5 ])))

// console.log(into(flatten([ [1, 2], [ 3, 4 ], [ 7, 8 ], [ [ 9 ] ] ])))

});
