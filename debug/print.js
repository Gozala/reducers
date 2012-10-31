"use strict";

var accumulate = require("../accumulate")
var reducible = require("../reducible")
var end = require("../end")
var isError = require("../is-error")

var write = (function() {
  if (typeof(process) !== "undefined" &&
      typeof(process.stdout) !== "undefined" &&
      typeof(process.stdout.write) === "function")
    return process.stdout.write.bind(process.stdout)
  else
    return console.log.bind(console)
})()

function print(source) {
  var open = false
  accumulate(source, function printAccumulate(value) {
    if (!open) write("< ")
    open = true

    if (value === end) write(">\n")
    else if (isError(value)) write("\u26A1 " + value + " >\n")
    else write(JSON.stringify(value, 2, 2) + " ")
  })
}

module.exports = print
