/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

'use strict';

var flatten = require("./flatten")
var map = require("./map")

function expand(source, f) {
  /**
  Takes `source` sequence maps each item via `f` to a new sequence
  and then flattens them down into single form sequence. Note that
  returned sequence will have items ordered by time and not by index,
  if you wish opposite you need to force sequential order by wrapping
  `source` into `sequential` before passing it.

  ## Example

  var sequence = expand([ 1, 2, 3 ], function(x) {
    return [ x, x * x ]
  })
  print(sequence)   // => <stream 1 1 2 4 3 9 />

  **/
  return flatten(map(source, f))
}

module.exports = expand

