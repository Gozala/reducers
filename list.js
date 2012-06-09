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
var reducers = require('./core'),
    Reducible = reducers.Reducible, reduced = reducers.reduced,
    is = reducers.is, reduce = reducers.reduce

var ego = require('alter-ego/core'),
    define = ego.define, record = ego.record

var List = define(
  record, [ 'head', 'tail' ],
  Reducible, {
    reduce: function(next, list, start) {
      return reduce(next, list.tail, next(start, list.head))
    }
  })

function list(head, tail) {
  return new List(head, tail)
}
exports.list = list

});
