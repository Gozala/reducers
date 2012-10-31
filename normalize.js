"use strict";

var reducible = require("./reducible")
var accumulate = require("./accumulate")

function normalize(source) {
  /**
  Takes potentially broken `source` collection and returns normalized,
  version of it. That suppress values after `source` is being ended, or
  errored.
  **/
  // If source is instance of reducible it's already normalized so there is
  // no need of normalizing it any more.
  if (source instanceof reducible.type) return source
  return reducible(function accumulateNormalized(next, initial) {
    accumulate(source, next, initial)
  })
}

module.exports = normalize
