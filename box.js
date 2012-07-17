/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

module.exports = function Box(description) {
  description = description || 'Boxed value'
  return function box(value) {
    return {
      isBoxed: true,
      is: box,
      value: value,
      description: description
    }
  }
}
