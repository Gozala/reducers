/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var hub = require('./hub')
var signal = require('./signal'),
    emit = signal.emit, close = signal.close

function channel() {
  return hub(signal())
}
channel.enqueue = emit
channel.close = close

module.exports = channel
