/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var convert = require("./convert")
var when = require("eventual/when")
var end = require("./end")
var error = require("./error")

function reducible(source, f) {
  return convert(source, function(source, next, initial) {
    var result = f(source, function forward(result, value) {
      return next(value, result)
    }, initial)
    when(result, function(value) {
      next(end(), value)
    }, function(e) {
      next(error(e))
    })
  })
}

module.exports = reducible
