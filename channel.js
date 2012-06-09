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
    exports.EXPORTED_SYMBOLS = Object.keys(exports);
  } else {  // Browser or alike
    var globals = this
    factory(function require(id) {
      return globals[id];
    }, (globals[id] = {}), { uri: document.location.href + '#' + id, id: id });
  }
}).call(this, 'reducers', function(require, exports, module) {

'use strict';

var protocol = require('protocol/core').protocol
var reducers = require('./core'),
    Reducible = reducers.Reducible, reduced = reducers.reduced,
    is = reducers.is, reduce = reducers.reduce, reducible = reducers.reducible
var eventuals = require('eventual/core'),
    defer = eventuals.defer, go = eventuals.go, realize = eventuals.realize,
    then = eventuals.then, Deferred = eventuals.Deferred,
    eventual = eventuals.eventual
var ego = require('alter-ego/core'),
    define = ego.define, record = ego.record, over = ego.over
var queue = require('./queue'),
    Queueable = queue.Queueable, enqueue = queue.enqueue,
    Closable = queue.Closable, close = queue.close,
    closed = queue.closed, Reactor = queue.Reactor,
    react = queue.react

var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

function identity(value) { return value }

// Implement `reduce` for eventual values, that way reduce can
// be delayed until it's realized.
define(
  over, Deferred,
  Reducible, {
    reduce: eventual(function reduce(f, reducible, start) {
      return reduce(f, reducible, start)
    })
  })

Closable({
  close: function(closable) {
    return closable
  }
})

var Channel = define(
  record, [ 'reducers', 'queued', 'meta' ],
  Reactor, {
    react: function(channel) {
      var reducers = channel.reducers
      channel.queued.splice(0).forEach(function(item) {
        reducers.slice(0).forEach(function(reducer) {
          // TODO: Add exception handling to reject promise
          // if it occurs.
          var result = reducer.next(reducer.state, item)
          //if (is(result, reduced)) {
          //  reducers.splice(index, 1)
          //  realize(reducer.promise, result.value)
          //} else {
            //reducer.state = result
            reducer.state = go(function(result) {
              if (is(result, reduced)) {
                var index = reducers.indexOf(reducer)
                realize(reducer.promise, result.value)
                if (~index) reducers.splice(index, 1)
                if (!reducers.length) close(channel)
              }
              return result
            }, result);
          //}
        })
      })
    }
  },
  Queueable, {
    enqueue: function(channel, item) {
      if (!closed(channel)) {
        channel.queued.push(item)
        react(channel)
      }
      return channel
    }
  },
  Closable, {
    closed: function(channel) {
      return !channel.queued && !channel.reducers
    },
    close: function(channel) {
      if (!closed(channel)) {
        var reducers = channel.reducers, count = reducers.length, index = 0
        channel.queued = channel.reducers = null
        while (index < count) {
          var reducer = reducers[index++]
          realize(reducer.promise, reducer.state)
        }
      }
      return channel
    }  
  },
  Reducible, {
    reduce: function(f, channel, start) {
      // If channel is closed it acts like an empty list returning `start`
      if (closed(channel)) return start
      var promise = defer()
      channel.reducers.push({ next: f, state: start, promise: promise })
      react(channel)
      return promise
    }
  })

function channel(meta) {
  /**
  Channel creates new `reducible` where new items can be queued using
  `enqueue(my.channel, item)`. Channel also can be closed `close(my.channel)`.
  Channel can be reduced simultaneously by multiple consumers. Once all
  consumers are done reducing channel it's closed (This is in a sense similar
  to how nodejs quits once there's no task is left in a queue). All items are
  enqueued up until first consumption.
  **/
  return new Channel([], [], meta)
}
exports.channel = channel
exports.Channel = Channel
exports.enqueue = enqueue
exports.close = close
exports.closed = closed
exports.reduce = reduce


function sequential(channel) {
  return reducible(function(next, start) {
    return reduce(eventual(next), channel, start)
  })
}
exports.sequential = sequential

function parallel(channel) {
  return reducible(function(next, start) {
    return reduce(next, channel, start)
  }, channel)
}
exports.parallel = parallel

var zip = new function() {
  var end = {}
  function drained(branch) { return !branch.queued.length }
  function pending(branch) { return branch.queued.length }
  function shift(branch) { return branch.queued.shift() }
  function ended(branch) { return branch.queued[0] === end }

  function react(state) {
    if (state.branches.some(ended)) {
      realize(state.promise, state.result)
      state.result = reduced(state.result)
    } else if (state.branches.every(pending)) {
      var zipped = state.branches.map(shift)
      state.result = state.next(state.result, zipped)
      realize(state.pending.shift(), state.result)
    }

    if (is(state.result, reduced))
      realize(state.promise, state.result.value)
  }

  return function zip() {
    var sources = slice(arguments)

    return reducible(function(next, start) {
      var state = {
        pending: [],
        promise: defer(),
        result: start,
        value: defer(),
        next: next,
        branches: sources.map(function(source) {
          return { source: source, queued: [], pending: [] }
        })
      }

      state.branches.forEach(function(branch) {
        var index = 0
        var result = reduce(function(_, value) {
          var pending = state.pending
          var result = pending[index] || (pending[index] = defer())
          index ++
          branch.queued.push(value)
          react(state)
          return result
        }, branch.source)

        go(function() {
          branch.queued.push(end)
          react(state)
        }, result)
      })

      return go(identity, state.promise)
    })
  }
}
exports.zip = zip

});
