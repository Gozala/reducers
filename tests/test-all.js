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

exports['test filter'] = require('./filter')
exports['test map'] = require('./map')
exports['test take'] = require('./take')
exports['test pick'] = require('./pick')
exports['test drop'] = require('./drop')
exports['test skip'] = require('./skip')
exports['test into'] = require('./into')
exports['test append'] = require('./append')
exports['test flatten'] = require('./flatten')

exports['test channel'] = require('./channel')

if (module == require.main)
  require('test').run(exports)

});
