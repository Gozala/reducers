/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var core = require('../core'),
    take = core.take
var accumulators = require('../accumulator'),
    reduce = accumulators.reduce, into = accumulators.into
var signal = require('../signal'),
    emit = signal.emit, close = signal.close
var hub = require('../hub')

var eventuals = require('eventual/eventual'),
    await = eventuals.await

exports['test hub open / close propagate'] = function(assert, done) {
  var c = signal()
  var h = hub(c)

  assert.ok(!signal.isOpen(c), 'signal is not open')
  assert.ok(!signal.isClosed(c), 'signal is not closed')
  assert.ok(!signal.isClosed(h), 'hub is not closed')
  assert.ok(!signal.isOpen(h), 'hub is not opened')

  var p = into(h)

  assert.ok(signal.isOpen(c), 'signal is open after reduce is called')
  assert.ok(!signal.isClosed(c), 'signal is not closed until close is called')
  assert.ok(signal.isOpen(h), 'hub is open after reduce is called')
  assert.ok(!signal.isClosed(h), 'hub is not closed until close is called')

  emit(c, 1)
  emit(c, 2)
  close(c, 3)

  assert.ok(signal.isClosed(c), 'signal closed')
  assert.ok(signal.isClosed(h), 'hub is closed')

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3 ], 'all value were propagated')
    done()
  })
}

exports['test multiple subscribtion'] = function(assert, done) {
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

  await(p1, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3 ], 'first consumer get all messages')
    await(p2, function(actual) {
      assert.deepEqual(actual, [ 1, 2, 3],
                       'second consumer get all messages')
      await(p3, function(actual) {
        assert.deepEqual(actual, [ 2, 3 ],
                         'late consumer gets no prior messages')
        await(p4, function(actual) {
          assert.deepEqual(actual, [],
                           'gets no messages if no messages emitd')
          done()
        })
      })
    })
  })
}

exports['test source is closed on end'] = function(assert, done) {
  var c = signal()
  var h = hub(c)
  var t = take(h, 2)

  var p = into(t)

  emit(c, 1)
  emit(c, 2)

  assert.ok(signal.isClosed(h), 'signal is closed once consumer is done')

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2 ], 'value propagated')
    done()
  })
}

exports['test source is closed on last end'] = function(assert, done) {
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

  assert.ok(signal.isClosed(h), 'signal is closed once consumer is done')

  await(p1, function(actual) {
    assert.deepEqual(actual, [ 1 ], '#1 took 1 item')
    await(p2, function(actual) {
      assert.deepEqual(actual, [ 1, 2 ], '#2 took 2 items')
      await(p3, function(actual) {
        assert.deepEqual(actual, [ 2, 3, 4 ], '#3 took 3 items')
        done()
      })
    })
  })
}

exports['test reducing closed'] = function(assert, done) {
  var c = signal()
  var h = hub(c)

  var p1 = into(h)

  close(c, 0)
  assert.ok(signal.isClosed(h), 'hub is closed')
  assert.ok(signal.isClosed(c), 'signal is closed')

  var p2 = into(h)

  await(p1, function(actual) {
    assert.deepEqual(actual, [ 0 ], 'only item was collected')
    await(p2, function(actual) {
      assert.deepEqual(actual, [], 'after close reduces to empty')
      done()
    })
  })
}

exports['test hub with non signals'] = function(assert) {
  assert.equal(hub(null), null, 'null is considered to be a hub')
  assert.equal(hub(), undefined, 'undefined is considered to be a hub')


  var h = hub([ 1, 2, 3 ])
  var p1 = into(h)
  var p2 = into(h)

  assert.deepEqual(p1, [ 1, 2, 3 ], 'first reduce got all items')
  assert.deepEqual(p2, [ 1, 2, 3 ], 'second reduce got all items')
}


if (module == require.main)
  require('test').run(exports)
