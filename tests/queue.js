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
var queue = require('../queue')

var eventuals = require('eventual/eventual'),
    await = eventuals.await

exports['test queue before open'] = function(assert, done) {
  var c = channel()
  var q = queue(c)

  assert.ok(!isOpen(q), 'queue is not open')

  enqueue(q, 1)
  enqueue(q, 2)

  var p = reduce(q, function(result, value) {
    result.push(value)
    return result
  }, [])

  enqueue(q, 3)
  close(q, 4)

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3, 4 ],
                     'queued values were consumed')
    done()
  })
}

if (module == require.main)
  require('test').run(exports)
