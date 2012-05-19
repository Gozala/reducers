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

var reducers = require('../core'),
    map = reducers.map, filter = reducers.filter, reduce = reducers.reduce
var Benchmark = require('benchmark/benchmark')
var suite = Benchmark.Suite()

// Some helper functions we'll use
function increment(x) { return x + 1 }
function isOdd(n) { return n % 2 }
function range(from, to) {
  var items = []
  while (from < to) items.push(from++)
  return items
}
function sum(a, b) {
  return a + b
}

var numbers = range(0, 100000)

suite.add('standard array', function() {
  numbers.filter(isOdd).map(increment).reduce(sum)
}).add('arguments', function() {
  reduce(sum, map(increment, filter(isOdd, numbers)))
}).on('cycle', function(event, bench) {
  console.log(String(bench))
}).on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'))
}).run({ 'async': true })

});
