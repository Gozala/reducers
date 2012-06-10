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
    Closable = queue.Closable, close = queue.close,
    closed = queue.closed

var unbind = Function.call.bind(Function.bind, Function.call)
var slice = Array.slice || unbind(Array.prototype.slice)

var Openable = protocol({
  opened: [ protocol ],
  open: [ protocol ]
})
var open = Openable.open
var opened = Openable.opened
exports.open = open
exports.opened = opened
exports.Openable = Openable

function identity(value) { return value }

var update = eventual(function(hub, reducer, value) {
  var reducers = hub.reducers
  if (is(value, reduced)) {
    var index = reducers.indexOf(reducer)
    realize(reducer.result, value.value)
    if (~index) reducers.splice(index, 1)
    if (!reducers.length) close(hub)
  }
  return value
})


var Hub = define(
  record, [ 'source', 'reducers', 'result', 'meta' ],
  Openable, {
    opened: function(hub) {
      return !!hub.result
    },
    open: function(hub) {
      if (!closed(hub) && !opened(hub)) {
        var result = defer()
        hub.result = result
        reduce(function(_, value) {
          var reducers = hub.reducers.slice(0)
          var count = reducers.length, index = 0
          while (index < count) {
            var reducer = reducers[index++]
            var state = reducer.next(reducer.state, value)
            reducer.state = update(hub, reducer, state)
          }
          return result
        }, hub.source)
      }
    }
  },
  Closable, {
    closed: function(hub) {
      return !hub.reducers
    },
    close: function(hub) {
      if (!closed(hub)) {
        var reducers = hub.reducers, count = reducers.length, index = 0
        var result = hub.result
        hub.reducers = hub.source = hub.result = null
        realize(result, reduced())
        while (index < count) {
          var reducer = reducers[index++]
          realize(reducer.result, reducer.state)
        }
      }
      return hub
    }
  },
  Reducible, {
    reduce: function(f, hub, start) {
      if (closed(hub)) return start
      var reducer = { next: f, state: start, result: defer() }
      hub.reducers.push(reducer)
      if (!opened(hub)) open(hub)
      return go(identity, reducer.result)
    }
  })

function hub(stream, meta) {
  return new Hub(stream, [], null, meta)
}
exports.hub = hub
exports.Hub = Hub

});

