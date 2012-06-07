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
    pick = $.pick, into = $.into

exports['test pick'] = function(assert) {
  var actual = pick(2, [ 1, 2, 3, 4 ])

  assert.deepEqual(into(actual), [ 1, 2 ], 'picked two items')
  assert.deepEqual(into(actual), [ 1, 2 ], 'can be re-reduced same')
}

exports['test pick none'] = function(assert) {
  var actual = pick(0, [ 1, 2, 3, 4 ])

  assert.deepEqual(into(actual), [], 'picks none on 0')
}

exports['test pick all'] = function(assert) {
  var actual = pick(100, [ 1, 2, 3, 4 ])

  assert.deepEqual(into(actual), [ 1, 2, 3, 4 ],
                   'picks all if has less than requested')
}

if (module == require.main)
  require('test').run(exports)

});
