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
var buffer = require('../buffer')

var eventuals = require('eventual/eventual'),
    await = eventuals.await

exports['test channel bufferring'] = function(assert, done) {
  var c = channel()
  var b = buffer(c)

  assert.ok(isOpen(c), 'buffer opens a channel')

  enqueue(c, 1)
  enqueue(b, 2)

  var p = reduce(b, function(result, value) {
    result.push(value)
    return result
  }, [])

  enqueue(c, 3)
  close(c, 4)

  await(p, function(actual) {
    assert.deepEqual(actual, [ 1, 2, 3, 4 ],
                     'values have being buffered')
    done()
  })
}

if (module == require.main)
  require('test').run(exports)

