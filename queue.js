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

function identity(value) { return value }

var Enqueueable = protocol({
  enqueue: [ protocol, Object ]
})
var enqueue = Enqueueable.enqueue
exports.enqueue = enqueue
exports.Enqueueable = Enqueueable


var Reactor = protocol({
  react: [ protocol ]
})
var react = Reactor.react
exports.Reactor = Reactor
exports.react = react

var Queue = define(
  record, [ 'queued', 'reducers' ],
  Reactor, {
    react: function react(queue) {
      var queued = queue.queued
      var reducers = queue.reducers
      while (queued.length && reducers.length) {
        var reducer = reducers[0]
        var result = reducer.next(reducer.state, queued.shift())
        if (is(result, reduced)) {
          reducers.shift()
          realize(reducer.result, result.value)
        } else {
          reducer.state = result
        }
      }
    }
  },
  Enqueueable, {
    enqueue: function enqueue(queue, item) {
      queue.queued.push(item)
      react(queue)
    }
  },
  Reducible, {
    reduce: function reduce(f, queue, start) {
      var promise = defer()
      queue.reducers.push({ next: f, state: start, results: promise })
      react(queue)
      return go(identity, promise)
    }
  })

function queue() { return new Queue([], [], [], []) }
exports.queue = queue

});
