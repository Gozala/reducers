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

exports["test error in the recovered stream"] = function(assert) {
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
    return ["a", "b", brax, "c"]
  })

  assert.throws(function() {
    fold(fixed, function(value, result) {
      delivered.push(value)
    }, [])
  }, "Error in recovery collection are thrown if they reach fold")

  assert.ok(capture, "Firs error was captured")
  assert.deepEqual(delivered, [1, 2, "a", "b"],
                   "items yield before error reach fold")
}

exports["test second recovery"] = function(assert) {
  var boom = Error("Boom")
  var brax = Error("BraxXXx")

  var captured = false
  var recaptured = false
  var delivered = []

  var source = [1, 2, 3, 4]
  var input = map(source, function(value) {
    if (value > 2) throw boom
    return value
  })

  var fixed = capture(input, function(error) {
    captured = true
    assert.equal(error, boom, "Error was captured")
    return ["a", "b", brax, "c"]
  })

  var mapped = map(fixed, function(x) { return x + "!" })

  var final = capture(mapped, function(error) {
    recaptured = true
    assert.equal(error, brax, "Error was re-captured")
    return "I give up"
  })

  var result = fold(final, function(value) {
    delivered.push(value)
  })

  assert.ok(capture, "Firs error was captured")
  assert.ok(recaptured, "Second error was captured")

  assert.deepEqual(delivered, ["1!", "2!", "a!", "b!", "I give up"],
                   "items yield before error reach fold")
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

exports["test error values are thrown if they reach fold"] = function(assert) {
  var boom = Error("Boom")
  var source = [1, 2, 3, 4]
  var input = map(source, function(value) {
    return value === 3 ? boom :
           value
  })
  var delivered = []

  assert.throws(function() {
    fold(input, function(value) {
      delivered.push(value)
    })
  }, "Error values passed to fold are thrown")

  assert.deepEqual(delivered, [1, 2], "items till error value are accumulated")
}

exports["test errors propagate through folds"] = function(assert) {
  var boom = Error("Boom")
  var source = event()

  var result = fold(source, function(value, result) {
    result.push(value)
    return result
  }, [])

  source.send(1)
  assert.throws(function() {
    source.send(boom)
  }, "Error is thrown by fold if error reaches it")

  assert.throws(function() {
    fold(result, function() {
      assert.fail(Error("Should not be called"))
    })
  }, "Error is thrown by folding an errored fold")
}
