"use strict";

// Consumption
exports.reduce = require("./reduce")

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
exports.buffer = require("./buffer")
exports.cache = require("./cache")
exports.hub = require("./hub")

// Events
exports.signal = require("./signal")
exports.channel = require("./channel")
exports.emit = require("./emit")
exports.close = require("./close")
exports.queue = require("./queue")

// development
exports.print = require("./debug/print")
exports.into = require("./into")
