/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var core = require('../core'),
    into = core.into, flatten = core.flatten, take = core.take
var accumulators = require('../accumulator'),
    reduce = accumulators.reduce
var channels = require('../channel'),
    channel = channels.channel, enqueue = channels.enqueue,
    close = channels.close, isClosed = channels.isClosed,
    isOpen = channels.isOpen,
    sequential = channels.sequential,
    parallel = channels.parallel

var eventuals = require('eventual/eventual'),
    await = eventuals.await

exports['test channel basics'] = function(assert, done) {
  var c = channel()

  assert.ok(!isOpen(c), 'channel is not open')
  assert.ok(!isClosed(c), 'channel is not closed')

  var p = reduce(c, function(result, value) {
    result.push(value)
    return result
  }, [])

  assert.ok(isOpen(c), 'channel is open after reduce is called')
  assert.ok(!isClosed(c), 'channel is not closed until close is called')

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3, 4 ],
                     'All queued values were accumulated')
    assert.ok(isClosed(c), 'channel is closed after it is closed')
    done()
  })

  enqueue(c, 1)
  enqueue(c, 2)
  enqueue(c, 3)
  close(c, 4)
}

exports['test channel auto-close'] = function(assert, done) {
  var c = channel()

  assert.ok(!isOpen(c), 'channel is not open')
  assert.ok(!isClosed(c), 'channel is not closed')

  var t = take(c, 3)

  assert.ok(!isOpen(c), 'channel is not open on take')
  assert.ok(!isClosed(c), 'channel is not closed on take')

  var p = reduce(t, function(result, value) {
    result.push(value)
    return result
  }, [])

  assert.ok(isOpen(c), 'channel is open after reduce is called')
  assert.ok(!isClosed(c), 'channel is not closed until close is called')

  enqueue(c, 1)
  enqueue(c, 2)
  enqueue(c, 3)

  assert.ok(isClosed(c), 'channel is closed once consumption is complete')

  assert.throws(function() {
    enqueue(c, 4)
  }, 'Error is thrown if queued to closed channel')
  assert.throws(function() {
    close(c)
  }, 'Error is thrown on close of closed channel')

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3 ],
                     'All queued values were accumulated')
    assert.ok(isClosed(c), 'channel is closed after it is closed')
    done()
  })
}

exports['test channel can have single consumer'] = function(assert, done) {
  var c = channel()
  var p = reduce(c, function(result, value) {
    result.push(value)
    return result
  }, [])

  assert.throws(function() {
    reduce(c, function() { })
  }, 'channel can be consumed by a single reader only')

  close(c, 0)
  await(p, function(actual) {
    assert.deepEqual(actual, [ 0 ], 'items were accumulated')
    done()
  })
}

/*
exports['test channel'] = function(assert, done) {
  var first = channel()
  var second = channel()

  var actual = into(sequential(flatten([ first, second ])))

  enqueue(second, 21)
  enqueue(first, 11)
  enqueue(first, 12)
  enqueue(second, 22)
  enqueue(second, 23)
  close(second)
  close(first)

  go(function(actual) {
    assert.deepEqual(actual, [ 11, 12, 21, 22, 23 ], 'channels preserve order')
    done()
  }, actual)
}

exports['test channel of channels'] = function(assert, done) {
  var owner = channel()
  var first = channel()
  var second = channel()

  var ordered = into(sequential(flatten(owner)))
  var unordered = into(flatten(owner))

  enqueue(owner, first)
  enqueue(first, 11)
  enqueue(owner, second)
  enqueue(second, 21)
  enqueue(first, 12)
  enqueue(second, 22)
  enqueue(second, 23)
  close(second)
  close(first)
  close(owner)

  go(function(ordered, unordered) {
    assert.deepEqual(ordered, [ 11, 12, 21, 22, 23 ], 'channels preserve order')
    assert.deepEqual(unordered, [ 11, 21, 12, 22, 23 ], 'fifo')
    done()
  }, ordered, unordered)
}

exports['test channel auto closes'] = function(assert, done) {
  var source = channel()
  var subset = pick(3, source)
  var actual = into(subset)

  enqueue(source, 1)
  enqueue(source, 2)
  enqueue(source, 3)

  assert.ok(closed(source), 'channel is closed once consumption is done')

  enqueue(source, 4)
  enqueue(source, 5)

  assert.ok(closed(source), 'channel is still closed')

  go(function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3 ], 'no new item were apended')
    done()
  }, actual)
}

exports['test auto close of channel of channels'] = function(assert, done) {
  var owner = channel(0), first = channel(1), second = channel(2)
  var flat = flatten(owner)
  var ordered = into(pick(2, sequential(flat)))
  var unordered = into(pick(4, flat))


  enqueue(owner, first)
  enqueue(owner, second)
  enqueue(second, 21)
  enqueue(first, 11)
  enqueue(first, 12)
  assert.ok(!closed(owner), 'channel is still open')
  enqueue(second, 22)
  enqueue(second, 23)
  enqueue(first, 13)

  assert.ok(closed(first), 'first channel is closed')
  assert.ok(closed(second), 'second channel is closed')
  assert.ok(closed(owner), 'owner channel is also closed')

  go(function(ordered, unordered) {
    assert.deepEqual(ordered, [ 11, 12 ], 'no new item were apended')
    assert.deepEqual(unordered, [ 21, 11, 12, 22 ], 'paralleled')
    done()
  }, ordered, unordered)
}
*/

if (module == require.main)
  require('test').run(exports)
