"use strict";

// Consumption
exports.reduce = require("./reduce")
exports.accumulate = require("./accumulate")

// Transformation
exports.filter = require("./filter")
exports.map = require("./map")
exports.reductions = require("./reductions")

// Combining streams
exports.concat = require("./concat")
exports.zip = require("./zip")

// Error handling
exports.capture = require("./capture")
exports.delay = require("./delay")

// Size changes
exports.dropWhile = require("./drop-while")
exports.drop = require("./drop")
exports.takeWhile = require("./take-while")
exports.take = require("./take")

// Buffering / caching / multiplexing
exports.buffer = require("./buffer")
exports.cache = require("./cache")
exports.hub = require("./hub")

// helpers

exports.end = require("./end")
exports.reduced = require("./reduced")
exports.isReduced = require("./is-reduced")
exports.isError = require("./is-error")

// development
exports.print = require("./debug/print")
exports.into = require("./into")

// core
exports.reducer = require("./reducer")
exports.reducible = require("./reducible")
