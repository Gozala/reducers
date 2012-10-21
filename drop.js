/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var transformer = require("./transformer")
var transform = require("./transform")


function drop(source, n) {
  /**
  Returns sequence of all `source`'s items after `n`-th one. If source contains
  less then `n` items empty sequence is returned.

  ## Example

  print(drop([ 1, 2, 3, 4 ], 2))  // => <stream 3 4 />
  print(drop([ 1, 2, 3 ], 5))     // => <stream />
  **/
  return transformer(source, function(source) {
    var count = n >= 0 ? n : 1
    return transform(source, function(next, value, result) {
      return count -- > 0 ? result :
                            next(value, result)
    })
  })
}

module.exports = drop
