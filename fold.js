"use strict";

var reduce = require("reducible/reduce")
var isError = require("reducible/is-error")
var isReduced = require("reducible/is-reduced")
var end = require("reducible/end")
var hub = require("./hub")

function Promise() {
  this.delivered = false
  this.next = void(0)
  this.initial = void(0)
}
reduce.define(Promise, function reducePromise(promise, next, initial) {
  if (promise.delivered) return reduce(promise.value, next, initial)
  promise.next = next
  promise.initial = initial
})

function deliver(promise, value) {
  promise.delivered = true
  promise.value = value
  if (promise.next) reduce(value, promise.next, promise.initial)
}


function fold(source, next, initial) {
  /**
  Fold is just like `reduce` with a difference that `next` reducer / folder
  function it takes has it's parameters reversed. One always needs `value`,
  but not always accumulated one. To avoid conflict with array `reduce` we
  have a `fold`.
  **/
  var promise = new Promise()
  reduce(source, function fold(value, state) {
    // If source is `end`-ed deliver accumulated `state`.
    // If is source has an error, deliver that.
    if (isError(value)) {
      deliver(promise, value)
      throw value
    }
    if (value === end) return deliver(promise, state)

    // Accumulate new `state`
    state = next(value, state)
    // If already reduced, then deliver.
    if (isReduced(state)) deliver(promise, state.value)

    return state
  }, initial)

  return promise.delivered ? promise.value : hub(promise)
}

module.exports = fold
