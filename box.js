/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

"use strict";

module.exports = function Box(description) {
  /**
  Create a "boxed" value.
  Boxed values may be used as flags to signify a mode or value.
  This is similar to the way some languages use magic constants to trigger
  a specific behavior or mode.

  Boxed values may have a description that explains how they are to be used.
  
  Returns a box object.
  **/
  description = description || "Boxed value"
  return function box(value) {
    return {
      isBoxed: true,
      is: box,
      value: value,
      description: description
    }
  }
}
