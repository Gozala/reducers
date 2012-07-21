/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true*/
'use strict';

var core = require('../core'),
    flatten = core.flatten, take = core.take
var accumulators = require('../accumulator'),
    reduce = accumulators.reduce, into = accumulators.into
var channels = require('../channel'),
    channel = channels.channel, enqueue = channels.enqueue,
    close = channels.close
var hubs = require('../hub'),
    hub = hubs.hub
var queue = require('../queue')

var eventuals = require('eventual/eventual'),
    await = eventuals.await

exports['test queue before open'] = function(assert, done) {
  var c = channel()
  var q = queue(c)

  assert.ok(!channel.isOpen(q), 'queue is not open')

  enqueue(q, 1)
  enqueue(q, 2)

  var p = into(q)

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
