"use strict";

exports["test filter"] = require("./filter")
exports["test map"] = require("./map")
exports["test take"] = require("./take")
exports["test take while"] = require("./take-while")
exports["test drop"] = require("./drop")
exports["test drop while"] = require("./drop-while")
exports["test into"] = require("./into")
exports["test concat"] = require("./concat")
exports["test flatten"] = require("./flatten")

exports["test signal"] = require("./signal")
exports["test hub"] = require("./hub")
exports["test queue"] = require("./queue")
exports["test buffer"] = require("./buffer")
exports["test zip"] = require("./zip")

exports["test delay"] = require("./delay")

if (module == require.main)
  require("test").run(exports)
