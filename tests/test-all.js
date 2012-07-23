/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

exports['test filter'] = require('./filter')
exports['test map'] = require('./map')
exports['test take'] = require('./take')
exports['test take while'] = require('./take-while')
exports['test drop'] = require('./drop')
exports['test drop while'] = require('./drop-while')
exports['test into'] = require('./into')
exports['test append'] = require('./append')
exports['test flatten'] = require('./flatten')

exports['test signal'] = require('./signal')
exports['test hub'] = require('./hub')
exports['test queue'] = require('./queue')

if (module == require.main)
  require('test').run(exports)
