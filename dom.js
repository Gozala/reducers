/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var channel = require('./channel'),
    enqueue = channel.enqueue
var core = require('./core'),
    convert = core.convert, accumulated = core.accumulated,
    end = core.end

function open(target, type, options) {
  var capture = options && options.capture || false
  return convert({}, function(self, next, state) {
    function handler(event) {
      state = next(event, state)
      if (state && state.is === accumulated) {
        if (target.removeEventListener)
          target.removeEventListener(type, handler, capture)
        else
          target.detachEvent(type, handler, capture)
        next(end(), state.value)
      }
    }
    if (target.addEventListener) target.addEventListener(type, handler, capture)
    else target.attachEvent('on' + type, handler)
  })
}
exports.open = open
