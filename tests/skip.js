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
    into = $.into, skip = $.skip

exports['test skip'] = function(assert) {
  var actual = skip(2, [ 1, 2, 3, 4 ])

  assert.deepEqual(into(actual), [ 3, 4 ], 'skipped two items')
  assert.deepEqual(into(actual), [ 3, 4 ], 'can be re-reduced same')
}

exports['test skip none'] = function(assert) {
  var actual = skip(0, [ 1, 2, 3, 4 ])

  assert.deepEqual(into(actual), [ 1, 2, 3, 4 ], 'skips none on 0')
}

exports['test skip all'] = function(assert) {
  var actual = skip(100, [ 1, 2, 3, 4 ])

  assert.deepEqual(into(actual), [],
                   'skips all if has less than requested')
}

if (module == require.main)
  require('test').run(exports)

});
