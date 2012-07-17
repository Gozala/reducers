/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var $ = require('../core'),
    into = $.into, flatten = $.flatten, pick = $.pick
var $ = require('../channel'),
    channel = $.channel, enqueue = $.enqueue, close = $.close,
    closed = $.closed, sequential = $.sequential, parallel = $.parallel

var go = require('eventual/core').go

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

if (module == require.main)
  require('test').run(exports);
