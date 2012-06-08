/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false */
/*global define: true, Cu: true, __URI__: true */
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
    this.EXPORTED_SYMBOLS = Object.keys(this);
  } else {  // Browser or alike
    var globals = this
    factory(function require(id) {
      return globals[id];
    }, (globals[id] = {}), { uri: document.location.href + '#' + id, id: id });
  }
}).call(this, 'loader', function(require, exports, module) {

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
  reduce: function(f, source, start) {
    return source.reduce(f, start)
  }
})
Reducible(Array, {
  reduce: function reduce(f, array, start) {
    var result = start, index = 0, count = array.length
    while (index < count) {
      result = f(result, array[index++])
      if (is(result, reduced)) return result.value
    }
    return result
  }
})
Reducible(undefined, null, {
  reduce: function reduce(f, _, start) {
    return start
  }
})

function marker(name) {
  return function mark(value) {
    return { name: name, value: value, is: mark }
  }
}

function is(item, marked) {
  return item && item.is === marked
}
exports.is = is

var reduced = marker('reduced')
exports.reduced = reduced

function reducible(reduce) {
  return { reduce: reduce }
}
exports.reducible = reducible

function reducer(process) {
  return function reductor(f, items) {
    return reducible(function(next, start) {
      return reduce(function(result, item) {
        return process(f, next, result, item)
      }, items, start)
    })
  }
}
exports.reducer = reducer

var filter = reducer(function(f, next, result, item) {
  /**
  Returns further reduced `reducible` to an
  items to which `f(item)` returns `true`
  **/
  return f(item) ? next(result, item) : result
})
exports.filter = filter
  
var map = reducer(function(f, next, result, item) {
  /**
  Returns `reducible` with each item mapped
  mapped as `f(item)`.
  **/
  return next(result, f(item))
})
exports.map = map

var take = reducer(function take(f, next, result, item) {
  /**
  Reduces given `reducible` to first `n` items to
  on which `f(item)` is `true`.
  **/
  return f(item) ? next(result, item) : reduced(result)
})
exports.take = take

function pick(n, source) {
  /**
  Reduces given `reducible` to a firs `n` items.
  **/
  return reducible(function(next, result) {
    var count = n
    return reduce(function(result, item) {
      count = count - 1
      return count === 0 ? reduced(next(result, item)) :
             count > 0 ? next(result, item) :
             reduced(result)
    }, source, result)
  })
}
exports.pick = pick

function drop(f, source) {
  /**
  Reduces `reducible` further by dropping first `n`
  items to on which `f(item)` ruturns `true`
  **/
  return reducible(function(next, result) {
    var active = true
    return reduce(function(result, item) {
      return active && (active = f(item)) ? result : next(result, item)
    }, source, result)
  })
}
exports.drop = drop

function skip(n, source) {
  /**
  Reduces given `reducible` to a firs `n` items.
  **/
  return reducible(function(next, result) {
    var count = n
    return reduce(function(result, item) {
      return count -- > 0 ? result : next(result, item)
    }, source, result)
  })
}
exports.skip = skip

function tail(source) {
  return skip(1, source)
}
exports.tail = tail

function head(source) {
  return reduce(function(result, item) {
    return reduced(item)
  }, source)
}
exports.head = head

function into(source, buffer) {
  /**
  Adds items of given `reducible` into
  given `array` or a new empty one if omitted.
  **/
  var result = buffer || []
  return reduce(function(_, item) {
    result.push(item)
    return result
  }, source, buffer || [])
}
exports.into = into

//console.log(into(skip(2, [ 1, 2, 3, 4, 5, 6 ])))

function append(first, second) {
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
  return reducible(function(next, start) {
    return reduce(function(result, nested) {
      return reduce(function(result, value) {
        result = next(result, value)
        return is(result, reduced) ? reduced(result) : result
      }, nested, result)
    }, source, start)
  })
}
exports.flatten = flatten

// console.log(into(flatten([ [1, 2], [ 3, 4 ], [], [ 7, 8 ] ])))

function expand(f, source) {
  return flatten(map(f, source))
}
exports.expand = expand

/*
console.log(into(expand(function(x) {
  return [ x, x * x ]
}, [ 1, 2, 3 ])))
*/


});
