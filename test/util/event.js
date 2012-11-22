"use strict";

var reducible = require("../../reducible")
var end = require("../../end")
var isReduced = require("../../is-reduced")

function event() {
  var self = reducible(function(next, initial) {
    self.isOpen = true
    self.next = next
    self.state = initial
  })
  self.dispatched = []
  self.state = void(0)
  self.send = function(value) {
    self.isEnded = value === end
    self.dispatched.push(value)
    self.state = self.next(value, self.state)
    self.isReduced = isReduced(self.state)
  }

  return self
}

module.exports = event
