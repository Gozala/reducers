"use strict";

var test = require("./util/test")
var event = require("./util/event")

var take = require("../take")
var fold = require("../fold")
var expand = require("../expand")
var into = require("../into")
var hub = require("../hub")
var concat = require("../concat")
var delay = require("../delay")
var merge = require("../merge")
var capture = require("../capture")
var map = require("../map")
var end = require("reducible/end")

function lazy(f) { return expand(1, f) }

exports["test hub open / close propagate"] = test(function(assert) {
  var c = event()
  var h = hub(c)

  assert.ok(!c.isOpen, "event is not open")
  assert.ok(!c.isEnded, "event is not ended")

  var actual = into(h)

  assert.ok(c.isOpen, "event is open after reduce is called")
  assert.ok(!c.isEnded, "event is not closed until close is called")

  c.send(1)
  c.send(2)
  c.send(3)
  c.send(end)

  assert.ok(c.isEnded, "event ended")

  assert(actual, [1, 2, 3], "all value were propagated")
})

exports["test multiple subscribtion"] = test(function(assert) {
  var c = event()
  var h = hub(c)
  var p1 = into(h)

  var p2 = into(h)


  c.send(1)

  var p3 = into(h)

  c.send(2)
  c.send(3)

  var p4 = into(h)

  c.send(end)

  var actual = concat("p1", p1, "p2", p2, "p3", p3, "p4", p4)

  assert(actual, [
    "p1", 1, 2, 3,
    "p2", 1, 2, 3,
    "p3", 2, 3,
    "p4"
  ], "reduce accumulates values send after reduce is called")
})

exports["test source is closed on end"] = test(function(assert) {
  var c = event()
  var h = hub(c)
  var t = take(h, 2)

  var actual = into(t)

  c.send(1)
  c.send(2)

  assert.ok(c.isReduced, "event is closed once consumer is done")

  assert(actual, [ 1, 2 ], "value propagated")
})

exports["test source is closed on last end"] = test(function(assert) {
  var c = event()
  var h = hub(c)
  var t1 = take(h, 1)
  var t2 = take(h, 2)
  var t3 = take(h, 3)

  var p1 = into(t1)

  var p2 = into(t2)

  c.send(1)

  var p3 = into(t3)

  c.send(2)
  c.send(3)
  c.send(4)

  assert.ok(c.isReduced, "event reduced")

  var actual = concat("#1", p1, "#2", p2, "#3", p3)
  assert(actual, [
    "#1", 1,
    "#2", 1, 2,
    "#3", 2, 3, 4
  ], "take picks items from where reduce accumulates")
})

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
                        return merge([take(source, 5), take(source, 8)])
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
                        return merge([take(source, 5), take(source, 8)])
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
  var c = event()
  var h1 = hub(c)
  var m = map(h1, function(x) {
    called = called + 1
    return x
  })
  var h2 = hub(m)

  var actual = concat(into(h2),
                      into(h2),
                      "x",
                      lazy(function() { return called }))

  c.send(1)
  c.send(2)
  c.send(3)
  c.send(end)

  assert(actual, [ 1, 2, 3, 1, 2, 3, "x", 3 ],
         "hub dispatches on consumers")
})

if (require.main === module)
  require("test").run(exports)
