"use strict";

var reducers = require("../core"),
    map = reducers.map, filter = reducers.filter, reduce = reducers.reduce
var Benchmark = require("benchmark/benchmark")
var suite = Benchmark.Suite()

// Some helper functions we'll use
function increment(x) { return x + 1 }
function isOdd(n) { return n % 2 }
function range(from, to) {
  var items = []
  while (from < to) items.push(from++)
  return items
}
function sum(a, b) {
  return a + b
}

var numbers = range(0, 100000)

suite.add("standard array", function() {
  numbers.filter(isOdd).map(increment).reduce(sum)
}).add("arguments", function() {
  reduce(sum, map(increment, filter(isOdd, numbers)))
}).on("cycle", function(event, bench) {
  console.log(String(bench))
}).on("complete", function() {
  console.log("Fastest is " + this.filter("fastest").pluck("name"))
}).run({ "async": true })
