"use strict";

var transform = require("./transform")

function map(source, f) {
  /**
  Returns transformed version of given `source` where each item of it
  is mapped using `f`.

  ## Example

  var data = [{ name: "foo" }, { name: "bar" }]
  var names = map(data, function(value) { return value.name })
  print(names) // => <stream "foo" "bar" />
  **/
  return transform(source, function(next, value, accumulated) {
    return next(f(value), accumulated)
  })
}

module.exports = map

