"use strict";

// Consumption
exports.reduce = require("./reduce")
exports.accumulate = require("./accumulate")

// Transformation
exports.filter = require("./filter")
exports.map = require("./map")
exports.reductions = require("./reductions")

// Control flow
exports.sequential = require("./sequential")

// Combining streams
exports.concat = require("./concat")
exports.flatten = require("./flatten")
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
exports.queue = require("./queue")
exports.buffer = require("./buffer")
exports.cache = require("./cache")
exports.hub = require("./hub")

// Events
exports.signal = require("./signal")
exports.channel = require("./channel")
exports.emit = require("./emit")
exports.close = require("./close")
exports.pipe = require("./pipe")

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
