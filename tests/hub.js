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
var hubs = require('../hub'),
    hub = hubs.hub

var eventuals = require('eventual/eventual'),
    await = eventuals.await

exports['test hub open / close propagate'] = function(assert, done) {
  var c = channel()
  var h = hub(c)

  assert.ok(!isOpen(c), 'channel is not open')
  assert.ok(!isClosed(c), 'channel is not closed')
  assert.ok(!isClosed(h), 'hub is not closed')
  assert.ok(!isOpen(h), 'hub is not opened')

  var p = reduce(h, function(result, value) {
    result.push(value)
    return result
  }, [])

  assert.ok(isOpen(c), 'channel is open after reduce is called')
  assert.ok(!isClosed(c), 'channel is not closed until close is called')
  assert.ok(isOpen(h), 'hub is open after reduce is called')
  assert.ok(!isClosed(h), 'hub is not closed until close is called')

  enqueue(c, 1)
  enqueue(c, 2)
  close(c, 3)

  assert.ok(isOpen(c), 'channel is open')
  assert.ok(isClosed(c), 'channel closed')
  assert.ok(isClosed(h), 'hub is closed')
  assert.ok(isOpen(h), 'hub is opened')

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3 ], 'all value were propagated')
    done()
  })
}

exports['test multiple subscribtion'] = function(assert, done) {
  var c = channel()
  var h = hub(c)
  var p1 = reduce(h, function(result, value) {
    result.push(value)
    return result
  }, [])

  var p2 = reduce(h, function(result, value) {
    result.push(value)
    return result
  }, [])


  enqueue(c, 1)

  var p3 = reduce(h, function(result, value) {
    result.push(value)
    return result
  }, [])

  enqueue(c, 2)
  enqueue(c, 3)

  var p4 = reduce(h, function(result, value) {
    result.result(value)
    return result
  }, [])

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
                           'gets no messages if no messages enqueued')
          done()
        })
      })
    })
  })
}

exports['test source is closed on end'] = function(assert, done) {
  var c = channel()
  var h = hub(c)
  var t = take(h, 2)

  var p = reduce(t, function(result, value) {
    result.push(value)
    return result
  }, [])

  enqueue(c, 1)
  enqueue(c, 2)

  assert.ok(isClosed(h), 'channel is closed once consumer is done')

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2 ], 'value propagated')
    done()
  })
}

exports['test source is closed on last end'] = function(assert, done) {
  var c = channel()
  var h = hub(c)
  var t1 = take(h, 1)
  var t2 = take(h, 2)
  var t3 = take(h, 3)

  var p1 = reduce(t1, function(result, value) {
    result.push(value)
    return result
  }, [])

  var p2 = reduce(t2, function(result, value) {
    result.push(value)
    return result
  }, [])

  enqueue(c, 1)

  var p3 = reduce(t3, function(result, value) {
    result.push(value)
    return result
  }, [])

  enqueue(c, 2)
  enqueue(c, 3)
  enqueue(c, 4)

  assert.ok(isClosed(h), 'channel is closed once consumer is done')

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
  var c = channel()
  var h = hub(c)

  var p1 = reduce(h, function(result, value) {
    result.push(value)
    return result
  }, [])

  close(c, 0)
  assert.ok(isClosed(h), 'hub is closed')
  assert.ok(isClosed(c), 'channel is closed')

  var p2 = reduce(h, function(result, value) {
    result.push(value)
    return result
  }, [])


  await(p1, function(actual) {
    assert.deepEqual(actual, [ 0 ], 'only item was collected')
    await(p2, function(actual) {
      assert.deepEqual(actual, [], 'after close reduces to empty')
      done()
    })
  })
}


if (module == require.main)
  require('test').run(exports)
