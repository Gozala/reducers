"use strict";

var Box = require("./box")

// Exported function can be used for boxing values. This boxing is used by
// `accumulate` function to message end of the sequence.
module.exports = Box("End of the sequence")
