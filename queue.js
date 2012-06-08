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
    is = reducers.is, reduce = reducers.reduce
var eventuals = require('eventual/core'),
    defer = eventuals.defer, go = eventuals.go, realize = eventuals.realize,
    then = eventuals.then
var ego = require('alter-ego/core'),
    define = ego.define, record = ego.record

var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)


function identity(value) { return value }

var Queueable = protocol({
  enqueue: [ protocol, Object ]
})
var enqueue = Queueable.enqueue
exports.enqueue = enqueue
exports.Queueable = Queueable

var Closable = protocol({
  closed: [ protocol ],
  close: [ protocol ]
})
var close = Closable.close
var closed = Closable.closed
exports.close = close
exports.closed = closed
exports.Closable = Closable


var Reactor = protocol({
  react: [ protocol ]
})
var react = Reactor.react
exports.Reactor = Reactor
exports.react = react

var Queue = define(
  record, [ 'queued', 'reducers' ],
  Queueable, {
    enqueue: function enqueue(queue, item) {
      if (!closed(queue)) {
        queue.queued.push(item)
        react(queue)
      }
    }
  },
  Reducible, {
    reduce: function reduce(f, queue, start) {
      var promise = defer()
      if (!closed(queue)) {
        queue.reducers.push({ next: f, state: start, promise: promise })
        react(queue)
      } else {
        realize(promise, start)
      }
      return promise
    }
  },
  Reactor, {
    react: function react(queue) {
      var queued = queue.queued
      var reducers = queue.reducers
      while (queued.length && reducers.length) {
        var reducer = reducers[0]
        var result = reducer.next(reducer.state, queued.shift())
        if (is(result, reduced)) {
          reducers.shift()
          realize(reducer.promise, result.value)
        } else {
          reducer.state = result
        }
      }
    }
  },
  Closable, {
    closed: function closed(queue) {
      return !queue.queued && !queue.reducers
    },
    close: function close(queue) {
      var reducers = queue.reducers, count = reducers.length, index = 0
      queue.queued = queue.reducers = null
      while (index < count) {
        var reducer = reducers[index++]
        realize(reducer.promise, reducer.state)
      }
    }
  })

function queue() {
  return new Queue(slice(arguments), [])
}
exports.queue = queue

});
