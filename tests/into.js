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
    into = $.into

exports['test into'] = function(assert) {
  var source = [ 1, 2, 3 ]
  assert.deepEqual(into(source), [ 1, 2, 3 ],
                   'returns identical')
  assert.notEqual(into(source), source,
                  'but different one')
}

exports['test into buffer'] = function(assert) {
  var buffer = [ 0 ]
  assert.equal(into([ 1, 2, 3 ], buffer), buffer,
               'reduces into buffer if provided')
  assert.deepEqual(buffer, [ 0, 1, 2, 3 ],
                   'pre-existing items in buffer are kept')
}

if (module == require.main)
  require('test').run(exports)

});

