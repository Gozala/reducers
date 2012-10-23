/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */

"use strict";

var Box = require("./box")

// Exported function can be used for boxing values. This boxing can be used
// to identify errors.
module.exports = Box("Error in the sequence")
