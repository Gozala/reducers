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

var Buffer = define(
  record, [ 'queued', 'result', 'next', 'meta' ],
  Queueable, {
    enqueue: function(buffer, value) {
      if (!closed(buffer)) {
        buffer.queued.push(value)
        react(buffer)
      }
      return buffer
    }
  },
  Reducible, {
    reduce: function(next, buffer, start) {
      if (closed(buffer)) return start
      buffer.state = start
      buffer.next = next
      react(buffer)
      return buffer.result
    }
  },
  Reactor, {
    react: function(buffer) {
      var queued = buffer.queued, next = buffer.next
      while (queued.length && next) {
        buffer.state = next(buffer.state, queued.shift())
        if (is(buffer.state, reduced)) return close(buffer)
      }
    }
  },
  Closable, {
    closed: function(buffer) {
      return !buffer.result
    },
    close: function(buffer) {
      if (!closed(buffer)) {
        var value = is(buffer.state, reduced) ? buffer.state.value : buffer.state
        realize(buffer.result,  value)
        buffer.next = buffer.state = buffer.result = buffer.queued = null
      }
      return buffer
    }
  })

function buffer(meta) {
  return new Buffer([], defer(), null, null, meta)
}
exports.buffer = buffer

});


