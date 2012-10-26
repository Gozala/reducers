"use strict";

var test = require("./util/test")
var concat = require("../concat")
var into = require("../into")
var delay = require("../delay")
var error = require("../error")
var capture = require("../capture")
var map = require("../map")
var expand = require("../expand")

function lazy(f) {
  return expand(1, function() { return f() })
}

exports["test capture empty stream"] = test(function(assert) {
  var called = 0
  var captured = capture([], function final() {
    called = called + 1
  })
  var actual = concat(captured, lazy(function() { return called }))


  assert(actual, [0], "error handler was not called")
})

exports["test capture with a non-empty stream"] = test(function(assert) {
  var actual = capture([1, 2], function() { return [3, 4] })

  assert(actual, [1, 2], "error handler has is not called")
})

exports["test error recovery"] = test(function(assert) {
  var boom = Error("Boom!")
  var actual = capture(error(boom), function catcher(e) {
    return [ "catch", e ]
  })

  assert(actual, ["catch", boom ], "error handler is called")
})

exports["test errors can be ignored"] = test(function(assert) {
  var boom = Error("Boom!")
  var brax = Error("brax")
  var source = concat(["h", "i"], error(boom))
  var captured = capture(source, function cacher(e) {
    return [e, error(brax)]
  })
  var actual = capture(captured, function(e) {
    return e
  })


  assert(actual, ["h", "i", boom, brax], "recovery code still may leak errors")
})

if (require.main === module)
  require("test").run(exports)
