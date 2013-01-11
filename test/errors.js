"use strict";

var test = require("./util/test")
var event = require("./util/event")
var fold = require("../fold")
var map = require("../map")
var capture = require("../capture")


exports["test error in input"] = function(assert) {
  var boom = Error("Boom")
  var input = [1, 2, boom]
  var delivered = []
  assert.throws(function() {
    fold(input, function(value) {
      delivered.push(value)
    })
  }, "If errors reach fold they are thrown")

  assert.deepEqual(delivered, [1, 2], "first two items were passed to fold")
}

exports["test transformation errors are thrown by fold"] = function(assert) {
  var boom = Error("Boom")
  var source = [1, 2, 3, 4]
  var delivered = []
  var input = map(source, function(value) {
    if (value > 2) throw boom
    return value
  })

  assert.throws(function() {
    fold(input, function(value, result) {
      delivered.push(value)
    }, [])
  }, "Transformation errors are thrown if they reach fold")

  assert.deepEqual(delivered, [1, 2], "items yield before error reach fold")
}

exports["test error in transformation"] = function(assert) {
  var captured = false
  var boom = Error("Boom")
  var source = [1, 2, 3, 4]
  var input = map(source, function(value) {
    if (value > 2) throw boom
    return value
  })
  var fixed = capture(input, function(error) {
    captured = true
    assert.equal(error, boom, "Error was captured")
    return ["interrupt"]
  })

  var result = fold(fixed, function(value, result) {
    result.push(value)
    return result
  }, [])

  assert.ok(capture, "error handler was invoked")
  assert.deepEqual(result, [1, 2, "interrupt"], "recovered from error")
}

exports["test error in recovery code"] = function(assert) {
  var boom = Error("Boom")
  var brax = Error("BraxXXx")
  var captured = false
  var delivered = []

  var source = [1, 2, 3, 4]
  var input = map(source, function(value) {
    if (value > 2) throw boom
    return value
  })
  var fixed = capture(input, function(error) {
    captured = true
    assert.equal(error, boom, "Error was captured")
    throw brax
  })

  assert.throws(function() {
    fold(fixed, function(value, result) {
      delivered.push(value)
    }, [])
  }, "Errors from recovery code are thrown if they reach fold")

  assert.ok(capture, "Firs error was captured")
  assert.deepEqual(delivered, [1, 2], "items yield before error reach fold")
}

exports["test error in fold"] = function(assert) {
  var input = [1, 2, 3, 4]

  assert.throws(function() {
    fold(input, function(value) {
      throw Error("Nope")
    })
  }, "Errors in fold are thrown")
}


exports["test intermidiate error in fold"] = function(assert) {
  var input = [1, 2, 3, 4]
  var delivered = []

  assert.throws(function() {
    fold(input, function(value) {
      delivered.push(value)
      if (delivered.length > 2) throw Error("Stop it already!")
    })
  }, "Occasional errors in fold are thrown out")

  assert.deepEqual(delivered, [1, 2, 3], "items before error are accumulated")
}
