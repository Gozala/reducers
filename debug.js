/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var reduce = require('./accumulator').reduce;
var when = require("eventual/when")

function print(source) {
  var open = false
  var promise = reduce(source, function(_, value) {
    if (!open) process.stdout.write('<stream ')
    open = true
    process.stdout.write(JSON.stringify(value, 2, 2) + ' ')
  }, false)
  when(promise, function() {
    if (!open) process.stdout.write('<stream ')
    process.stdout.write('/>\n> ')
  }, function(error) {
    if (!open) process.stdout.write('<stream ')
    process.stdout.write('/Error: ')
    process.stdout.write(error + ' ' + JSON.stringify(error, 2, 2))
    process.stdout.write('>\n> ')
  })
}
exports.print = print
