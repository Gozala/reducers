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

var $ = require('../core'),
    into = $.into, take = $.take

exports['test take'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = take(function(item) {
    called = called + 1
    return item <= 2
  }, source)

  assert.equal(called, 0, 'take does not invokes until result is reduced')
  assert.deepEqual(into(actual), [ 1, 2 ], 'items were taken')
  assert.equal(called, 3, 'taker called until it returns false')
  assert.deepEqual(into(actual), [ 1, 2 ], 'can be re-reduced')
}

exports['test take none'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3, 4 ]
  var actual = take(function(item) {
    called = called + 1
    return false
  }, source)

  assert.equal(called, 0, 'take does not invokes until result is reduced')
  assert.deepEqual(into(actual), [], '0 items were taken')
  assert.equal(called, 1, 'taker called once')
}

exports['test take all'] = function(assert) {
  var called = 0
  var source = [ 1, 2, 3 ]
  var actual = take(function(item) {
    called = called + 1
    return true
  }, source)

  assert.equal(called, 0, 'take does not invokes until result is reduced')
  assert.deepEqual(into(actual), [ 1, 2, 3 ], 'all items were taken')
  assert.equal(called, 3, 'taker called on each item')
}

if (module == require.main)
  require('test').run(exports)

});

