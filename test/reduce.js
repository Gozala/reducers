"use strict";

var reduce = require("../reduce")
var reduced = require("../reduced")
var into = require("../into")


exports["test reduce"] = function(assert) {
  var result = reduce([ 1, 2, 3 ], function(state, value) {
    return state + value
  }, 0)

  assert.equal(result, 6, "value is accumulated")
}

exports["test reduced early"] = function(assert) {
  var result = reduce([ 1, 2, 3 ], function(state, value) {
    return reduced("nope")
  }, 0)

  assert.equal(result, "nope", "early reduce value is accumulated")
}

exports["test reduce errored"] = function(assert) {
  var boom = Error("Boom!")
  var result = reduce([ 1, 2, boom ], function(state, value) {
    return state + value
  }, 0)

  assert.equal(result, boom, "errors propagate")
}

exports["test reduce late error"] = function(assert) {
  var boom = Error("Boom!")
  var result = reduce([ 1, 2, boom ], function(state, value) {
    return reduced("Wheuh")
  }, 0)

  assert.equal(result, "Wheuh", "late errors are irrelevant")
}

exports["test reduce null"] = function(assert) {
  var result = reduce(null, function(state, value) {
    return state + value
  }, 0)

  assert.equal(result, 0, "null reduces to initial")
}

exports["test reduce void"] = function(assert) {
  var result = reduce(void(0), function(state, value) {
    return state + value
  }, 0)

  assert.equal(result, 0, "void reduces to initial")
}

exports["test reduce empty"] = function(assert) {
  var result = reduce([], function(state, value) {
    return state + value
  }, 0)

  assert.equal(result, 0, "[] reduces to initial")
}

exports["test reduce string"] = function(assert) {
  var result = reduce("world", function(state, value) {
    return state + value
  }, "hello ")

  assert.equal(result, "hello world", "string is equivalent of array of itself")
}

exports["test reduce number"] = function(assert) {
  var result = reduce(7, function(state, value) {
    return state + value
  }, 10)

  assert.equal(result, 17, "number is equivalent of array of itself")
}

exports["test reduce object"] = function(assert) {
  var result = reduce({}, function(state, value) {
    return state + value
  }, "hello ")

  assert.equal(result, "hello " + {},
               "object is equivalent of array of itself")
}

exports["test reduce object"] = function(assert) {
  var boom = Error("Boom!")
  var result = reduce(boom, function(state, value) {
    return state + value
  }, "hello ")

  assert.equal(result, boom, "error is errored collection")
}

if (require.main === module)
  require("test").run(exports)
