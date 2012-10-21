/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var accumulate = require("./accumulate")
var deliver = require("pending/deliver")
var defer = require("eventual/defer")
var when = require("eventual/when")
var end = require("./end")
var error = require("./error")

function reduce(source, f, state) {
  var promise = defer()
  accumulate(source, function(value) {
    if (value && value.isBoxed) {
      if (value.is === end) deliver(promise, state)
      if (value.is === error) deliver(promise, value.value)
      return value
    } else {
      state = f(state, value)
      return state
    }
  }, state)
  return when(promise)
}

module.exports = reduce
