"use strict";

var Box = require("./box")

// Exported function can be used for boxing values. This boxing indicates
// that consumer of sequence has finished consuming it, there for new values
// should not be no longer pushed.
var accumulated = Box("Indicator that source has being accumulateed")

module.exports = accumulated
