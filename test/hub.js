"use strict";

var test = require("./util/test")

var take = require("../take")
var reduce = require("../reduce")
var expand = require("../expand")
var into = require("../into")
var signal = require("../signal")
var emit = require("../emit")
var close = require("../close")
var hub = require("../hub")
var concat = require("../concat")
var delay = require("../delay")
var flatten = require("../flatten")
var capture = require("../capture")
var map = require("../map")
var end = require("../end")

var when = require("eventual/when")

function lazy(f) { return expand(1, f) }

exports["test hub open / close propagate"] = function(assert, done) {
  var c = signal()
  var h = hub(c)

  assert.ok(!signal.isOpen(c), "signal is not open")
  assert.ok(!signal.isClosed(c), "signal is not closed")

  var p = into(h)

  assert.ok(signal.isOpen(c), "signal is open after reduce is called")
  assert.ok(!signal.isClosed(c), "signal is not closed until close is called")

  emit(c, 1)
  emit(c, 2)
  close(c, 3)

  assert.ok(signal.isClosed(c), "signal closed")

  when(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3 ], "all value were propagated")
    done()
  })
}

exports["test multiple subscribtion"] = function(assert, done) {
  var c = signal()
  var h = hub(c)
  var p1 = into(h)

  var p2 = into(h)


  emit(c, 1)

  var p3 = into(h)

  emit(c, 2)
  emit(c, 3)

  var p4 = into(h)

  close(c)

  when(p1, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3 ], "first consumer get all messages")
    when(p2, function(actual) {
      assert.deepEqual(actual, [ 1, 2, 3],
                       "second consumer get all messages")
      when(p3, function(actual) {
        assert.deepEqual(actual, [ 2, 3 ],
                         "late consumer gets no prior messages")
        when(p4, function(actual) {
          assert.deepEqual(actual, [],
                           "gets no messages if no messages emitd")
          done()
        })
      })
    })
  })
}

exports["test source is closed on end"] = function(assert, done) {
  var c = signal()
  var h = hub(c)
  var t = take(h, 2)

  var p = into(t)

  emit(c, 1)
  emit(c, 2)

  assert.ok(signal.isClosed(c), "signal is closed once consumer is done")

  when(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2 ], "value propagated")
    done()
  })
}

exports["test source is closed on last end"] = function(assert, done) {
  var c = signal()
  var h = hub(c)
  var t1 = take(h, 1)
  var t2 = take(h, 2)
  var t3 = take(h, 3)

  var p1 = into(t1)

  var p2 = into(t2)

  emit(c, 1)

  var p3 = into(t3)

  emit(c, 2)
  emit(c, 3)
  emit(c, 4)

  assert.ok(signal.isClosed(c), "signal is closed once consumer is done")

  when(p1, function(actual) {
    assert.deepEqual(actual, [ 1 ], "#1 took 1 item")
    when(p2, function(actual) {
      assert.deepEqual(actual, [ 1, 2 ], "#2 took 2 items")
      when(p3, function(actual) {
        assert.deepEqual(actual, [ 2, 3, 4 ], "#3 took 3 items")
        done()
      })
    })
  })
}

exports["test reducing closed"] = function(assert, done) {
  var c = signal()
  var h = hub(c)

  var p1 = into(h)

  close(c, 0)
  assert.ok(signal.isClosed(c), "signal is closed")

  var p2 = into(h)

  when(p1, function(actual) {
    assert.deepEqual(actual, [ 0 ], "only item was collected")
    when(p2, function(actual) {
      assert.deepEqual(actual, [], "after close reduces to empty")
      done()
    })
  })
}

exports["test hub with non signals"] = function(assert) {
  assert.equal(hub(null), null, "null is considered to be a hub")
  assert.equal(hub(), undefined, "undefined is considered to be a hub")


  var h = hub([ 1, 2, 3 ])
  var p1 = into(h)
  var p2 = into(h)

  assert.deepEqual(p1, [ 1, 2, 3 ], "first reduce got all items")
  assert.deepEqual(p2, [ 1, 2, 3 ], "second reduce got all items")
}

exports["test hub with sync steam"] = test(function(assert) {
  var source = hub([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ])

  var s1_3 = take(source, 3)
  var s4_8 = take(source, 5)
  var s9_$ = source

  var actual = concat(s1_3, [ "-" ], s4_8, [ "-" ], s9_$)

  assert(actual, [ 1, 2, 3, "-", 4, 5, 6, 7, 8, "-", 9, 10, 11, 12, 13, 14 ],
         "hub took items in parts")
})

exports["test hub with async stream"] = test(function(assert) {
  var source = hub(delay([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]))

  var actual = concat(take(source, 3),
                      "-",
                      lazy(function() {
                        return flatten([take(source, 5), take(source, 8)])
                      }),
                      "-",
                      lazy(function() {
                        return source
                      }),
                      "-",
                      lazy(function() {
                        return source
                      }))

  assert(actual, [
    1, 2, 3, "-",
    4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 11, "-",
    12, 13, 14, "-"
  ], "reads in the same turn share head")
})

exports["test hub with broken stream"] = test(function(assert) {
  var boom = Error("boom!")
  var source = hub(concat(delay([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]),
                   boom))

  var transformed = concat(take(source, 3),
                      "-",
                      lazy(function() {
                        return flatten([take(source, 5), take(source, 8)])
                      }),
                      "-",
                      lazy(function() {
                        return source
                      }),
                      "-",
                      lazy(function() {
                        return source
                      }))
  var actual = capture(transformed, function(error) {
    return error.message
  })


  assert(actual, [
    1, 2, 3, "-",
    4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 11, "-",
    12, 13, 14,
    boom.message
  ], "reads in the same turn share head")

})

exports["test map hub"] = test(function(assert) {
  var called = 0
  var s = signal()
  var h1 = hub(s)
  var m = map(h1, function(x) {
    called = called + 1
    return x
  })
  var h2 = hub(m)

  var actual = concat(into(h2),
                      into(h2),
                      "x",
                      lazy(function() { return called }))

  emit(s, 1)
  emit(s, 2)
  emit(s, 3)
  emit(s, end)

  assert(actual, [ 1, 2, 3, 1, 2, 3, "x", 3 ],
         "hub dispatches on consumers")
})

if (require.main === module)
  require("test").run(exports)
